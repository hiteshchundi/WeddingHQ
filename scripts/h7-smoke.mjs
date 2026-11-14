// Live disposable H7 verification. Real Auth.js database sessions; no app bypass.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { MongoClient, ObjectId } from "mongodb";
import { registerHooks } from "node:module";
registerHooks({ resolve(s,c,next) { if(s.startsWith(".") && c.parentURL?.includes("/src/") && !/\.[a-z]+$/i.test(s)) return next(new URL(`${s}.ts`,c.parentURL).href,c); return next(s,c); } });
const run=new ObjectId().toString(), userIds=[], weddingIds=[];
let client,db,stage="configuration",checks=0;
try {
  assert(["development","test"].includes(process.env.NODE_ENV)); assert(/(?:dev|test)/i.test(new URL(process.env.MONGODB_URI).pathname));
  const origin=process.argv[2]??"http://localhost:3000"; assert(/^http:\/\/localhost:\d+$/.test(origin));
  client=new MongoClient(process.env.MONGODB_URI);await client.connect();db=client.db();
  const actors=[];
  for(const label of ["owner","other","planner","admin","collaborator","inactive"]) {
    const _id=new ObjectId(),token=randomBytes(32).toString("base64url"),email=`h7-${run}-${label}@example.invalid`;userIds.push(_id);
    await db.collection("users").insertOne({_id,email,name:`H7 ${label}`,emailVerified:new Date(),createdAt:new Date(),updatedAt:new Date()});
    await db.collection("sessions").insertOne({userId:_id,sessionToken:token,expires:new Date(Date.now()+30*60000)});actors.push({id:_id,email,cookie:`authjs.session-token=${token}`});
  }
  const [owner,other,planner,admin,collaborator,inactive]=actors;
  async function request(actor,path,method="GET",body,expected=200,extra={}) {
    const previous=stage;stage=`${previous}: ${method} ${path}`;
    const response=await fetch(origin+path,{method,headers:{origin,"content-type":"application/json",...(actor?{cookie:actor.cookie}:{}),...extra},...(body===undefined?{}:{body:JSON.stringify(body)}),redirect:"manual"});
    assert.equal(response.status,expected);checks++;if(expected===204){stage=previous;return;}
    const json=await response.json();assert(!JSON.stringify(json).includes("__v"));if(expected>=400)assert(json.error?.code&&json.error?.message);stage=previous;return json;
  }
  stage="disposable wedding setup";
  const input={title:`[H7 SMOKE — DISPOSABLE] ${run}`,brideName:"H7 One",groomName:"H7 Two",timezone:"Asia/Kolkata",currency:"INR",startDate:new Date().toISOString(),endDate:new Date(Date.now()+7*86400000).toISOString()};
  const a=(await request(owner,"/api/v1/weddings","POST",input,201)).data;weddingIds.push(new ObjectId(a.id));
  const b=(await request(other,"/api/v1/weddings","POST",input,201)).data;weddingIds.push(new ObjectId(b.id));
  const base=`/api/v1/weddings/${a.id}`,foreign=`/api/v1/weddings/${b.id}`,members={};
  for(const [label,actor,role,status] of [["planner",planner,"PLANNER","ACTIVE"],["admin",admin,"ADMIN","ACTIVE"],["collaborator",collaborator,"COLLABORATOR","ACTIVE"],["inactive",inactive,"ADMIN","REVOKED"]]) {
    const _id=new ObjectId();members[label]=String(_id);await db.collection("wedding_memberships").insertOne({_id,weddingId:new ObjectId(a.id),userId:actor.id,email:actor.email,role,status});
  }
  const ownerMember=await db.collection("wedding_memberships").findOne({weddingId:new ObjectId(a.id),userId:owner.id});
  const foreignMember=await db.collection("wedding_memberships").findOne({weddingId:new ObjectId(b.id),userId:other.id});
  const eventInput={name:"Reception",type:"RECEPTION",timezone:"Asia/Kolkata",startsAt:new Date(Date.now()+4*86400000).toISOString()};
  const event=(await request(owner,`${base}/events`,"POST",eventInput,201)).data;
  const otherEvent=(await request(other,`${foreign}/events`,"POST",eventInput,201)).data;
  const vendorInput={name:"Royal Caterers",category:"Catering",contact:{person:"Test contact",phone:"0000000000",email:"test@example.invalid"},eventIds:[event.id,event.id],estimatedCostMinor:50000000,actualCostMinor:45000000,currency:"INR",responsibleMembershipId:members.planner,status:"CONFIRMED",notes:"H7 disposable"};
  stage="Vendor CRUD and Expense-only source of truth";
  const vendor=(await request(owner,`${base}/vendors`,"POST",vendorInput,201)).data;assert.deepEqual(vendor.eventIds,[event.id]);
  const otherVendor=(await request(other,`${foreign}/vendors`,"POST",{...vendorInput,eventIds:[otherEvent.id],responsibleMembershipId:String(foreignMember._id)},201)).data;
  let summary=(await request(owner,`${base}/expenses/summary`)).data;assert.deepEqual(summary,{currency:"INR",estimatedTotalMinor:0,actualTotalMinor:0,varianceMinor:0});
  const expenseInput={name:"Catering Deposit",category:"Catering",eventId:event.id,vendorId:vendor.id,estimatedAmountMinor:10000000,actualAmountMinor:9000000,currency:"INR",notes:"H7 disposable Expense"};
  const expense=(await request(owner,`${base}/expenses`,"POST",expenseInput,201)).data;
  summary=(await request(owner,`${base}/expenses/summary`)).data;assert.deepEqual(summary,{currency:"INR",estimatedTotalMinor:10000000,actualTotalMinor:9000000,varianceMinor:-1000000});
  await request(planner,`${base}/vendors/${vendor.id}`,"PATCH",{estimatedCostMinor:90000000,actualCostMinor:80000000,contact:{phone:"1111111111"}});
  assert.deepEqual((await request(admin,`${base}/expenses/summary`)).data,summary);
  const reread=(await request(owner,`${base}/vendors/${vendor.id}`)).data;assert.equal(reread.contact.person,"Test contact");assert.equal(reread.contact.phone,"1111111111");
  console.info("H7 source-of-truth PASS: Vendor estimate ₹5L with no Expenses -> ₹0 total; Expense estimate ₹1L/actual ₹90K -> ₹1L/₹90K, variance -₹10K (not ₹6L). Changing Vendor costs to ₹9L/₹8L leaves totals unchanged.");
  for(let reload=0;reload<2;reload++){assert.equal((await request(owner,`${base}/expenses/${expense.id}`)).data.vendorId,vendor.id);assert.equal((await request(owner,`${base}/vendors/${vendor.id}`)).data.estimatedCostMinor,90000000);}
  await request(admin,`${base}/expenses/${expense.id}`,"PATCH",{name:"Updated deposit",actualAmountMinor:9500000});assert.equal((await request(owner,`${base}/expenses/summary`)).data.varianceMinor,-500000);
  const row=await db.collection("expenses").findOne({_id:new ObjectId(expense.id)});assert(row.createdByMembershipId.equals(ownerMember._id));assert(Number.isSafeInteger(row.actualAmountMinor));assert(row.eventId.equals(new ObjectId(event.id)));
  assert.equal((await request(owner,`${base}/vendors?eventId=${event.id}&category=Catering&status=CONFIRMED&q=Royal`)).meta.total,1);
  assert.equal((await request(owner,`${base}/expenses?vendorId=${vendor.id}&eventId=${event.id}&category=Catering`)).meta.total,1);
  await request(owner,`${base}/vendors/${vendor.id}`,"DELETE",undefined,409);assert(await db.collection("expenses").findOne({_id:new ObjectId(expense.id)}));
  await request(owner,`${base}/events/${event.id}`,"DELETE",undefined,409);
  await request(owner,base,"PATCH",{currency:"USD"},409);

  stage="money parsing, exact storage and edge cases";
  const {parseMoney,moneyInput,formatMoney,expenseTotals,expenseVariance}=await import("../src/components/wedding/money.ts");
  for(const [text,minor] of [["0",0],["25000",2500000],["1234.56",123456],["90071992547409.91",Number.MAX_SAFE_INTEGER]]) {assert.equal(parseMoney(text),minor);assert.equal(parseMoney(moneyInput(minor)),minor);}
  assert(formatMoney(Number.MAX_SAFE_INTEGER).endsWith(".91")); assert.equal(formatMoney(1),"₹0.01");assert.equal(parseMoney(""),null);
  assert.equal(parseMoney("123","JPY"),123);assert.equal(parseMoney("1.234","KWD"),1234);
  for(const text of ["abc","NaN","Infinity","-1","1.234","1e3","90071992547409.92"])assert.throws(()=>parseMoney(text));
  assert.equal(expenseVariance(10000,10000),"On estimate");assert.throws(()=>expenseTotals([{estimatedAmountMinor:Number.MAX_SAFE_INTEGER},{estimatedAmountMinor:1}]));
  const blank=(await request(owner,`${base}/expenses`,"POST",{name:"Blank actual",category:"Custom category",estimatedAmountMinor:123456,actualAmountMinor:null},201)).data;assert.equal(blank.actualAmountMinor,null);
  assert.equal((await request(owner,`${base}/expenses/summary`)).data.actualTotalMinor,9500000);
  const zero=(await request(owner,`${base}/expenses`,"POST",{name:"Zero",category:"Other",estimatedAmountMinor:0,actualAmountMinor:0},201)).data;
  await request(owner,`${base}/expenses/${zero.id}`,"DELETE",undefined,204);await request(owner,`${base}/expenses/${blank.id}`,"DELETE",undefined,204);
  const max=(await request(owner,`${base}/vendors`,"POST",{name:"Large reference only",category:"Custom",estimatedCostMinor:Number.MAX_SAFE_INTEGER},201)).data;
  assert.equal((await request(owner,`${base}/vendors/${max.id}`)).data.estimatedCostMinor,Number.MAX_SAFE_INTEGER);
  await request(owner,`${base}/vendors/${max.id}`,"DELETE",undefined,204);
  const current=(await request(owner,`${base}/expenses/summary`)).data;
  await request(owner,`${base}/expenses`,"POST",{name:"Would overflow total",category:"Other",estimatedAmountMinor:Number.MAX_SAFE_INTEGER},422);
  assert.deepEqual((await request(owner,`${base}/expenses/summary`)).data,current);
  for(const amount of [-1,1.25,"100",null]) {
    if(amount===null)continue;
    await request(owner,`${base}/expenses`,"POST",{...expenseInput,estimatedAmountMinor:amount},422);
    await request(owner,`${base}/vendors/${vendor.id}`,"PATCH",{actualCostMinor:amount},422);
  }
  for(const fields of [{currency:"USD"},{eventId:otherEvent.id},{vendorId:otherVendor.id}])await request(owner,`${base}/expenses`,"POST",{...expenseInput,...fields},422);
  for(const fields of [{currency:"USD"},{eventIds:[otherEvent.id]},{responsibleMembershipId:String(foreignMember._id)},{responsibleMembershipId:members.inactive},{responsibleMembershipId:String(new ObjectId())}])await request(owner,`${base}/vendors`,"POST",{...vendorInput,...fields},422);
  for(const fields of [{weddingId:b.id},{createdByMembershipId:members.admin},{status:"PAID"},{estimatedAmountMinor:Number.MAX_SAFE_INTEGER+1},{actualAmountMinor:1.5},{notes:"x".repeat(5001)},{vendorId:"forged"}])await request(owner,`${base}/expenses`,"POST",{...expenseInput,...fields},422);
  for(const fields of [{weddingId:b.id},{status:"PAID"},{website:"https://example.com"},{contact:{email:"invalid"}},{contact:{website:"https://example.com"}},{eventIds:["fixture-event"]}])await request(owner,`${base}/vendors`,"POST",{...vendorInput,...fields},422);
  await request(owner,`${base}/vendors?q=.*`);assert.equal((await request(owner,`${base}/vendors?q=.*`)).meta.total,0);
  for(const suffix of ["vendors?status[$ne]=CANCELLED","expenses?vendorId[$ne]=x","expenses?category[$regex]=.*","vendors?eventId=fixture"])await request(owner,`${base}/${suffix}`,"GET",undefined,422);
  await request(owner,`${base}/expenses/${expense.id}`,"PATCH",{actualAmountMinor:1},403,{origin:"https://unrelated.invalid"});
  console.info("H7 money/validation PASS: integer minor units, exact ₹1234.56 parsing, zero/null/large values, overflow rollback, currency consistency, strict filters and protected-field rejection.");

  stage="role and tenant isolation";
  for(const [actor,status] of [[null,401],[other,404],[inactive,404],[collaborator,403]]) {
    for(const path of [`${base}/vendors`,`${base}/vendors/${vendor.id}`,`${base}/expenses`,`${base}/expenses/${expense.id}`,`${base}/expenses/summary`])await request(actor,path,"GET",undefined,status);
    await request(actor,`${base}/vendors`,"POST",vendorInput,status);await request(actor,`${base}/expenses`,"POST",expenseInput,status);
    await request(actor,`${base}/vendors/${vendor.id}`,"PATCH",{name:"forged"},status);await request(actor,`${base}/expenses/${expense.id}`,"PATCH",{actualAmountMinor:0},status);
    await request(actor,`${base}/vendors/${vendor.id}`,"DELETE",undefined,status);await request(actor,`${base}/expenses/${expense.id}`,"DELETE",undefined,status);
  }
  await request(other,`${foreign}/vendors/${vendor.id}`,"GET",undefined,404);
  await request(other,`${foreign}/expenses/${expense.id}`,"PATCH",{name:"foreign"},404);
  await request(owner,`${base}/vendors/${otherVendor.id}`,"DELETE",undefined,404);
  for(const actor of [planner,admin]) {
    const created=(await request(actor,`${base}/vendors`,"POST",{name:"Operational vendor",category:"Other"},201)).data;await request(actor,`${base}/vendors/${created.id}`,"DELETE",undefined,204);
    const added=(await request(actor,`${base}/expenses`,"POST",{name:"Operational expense",category:"Other"},201)).data;await request(actor,`${base}/expenses/${added.id}`,"DELETE",undefined,204);
  }
  for(const [collection,keys] of [["vendors",["category"]],["expenses",["eventId","vendorId"]]]) {const indexes=await db.collection(collection).indexes();assert(indexes.some(index=>index.key.weddingId===1&&Object.keys(index.key).length===1));for(const key of keys)assert(indexes.some(index=>index.key.weddingId===1&&index.key[key]===1));}
  for(const action of ["VENDOR_CREATED","VENDOR_UPDATED","EXPENSE_CREATED","EXPENSE_UPDATED"])assert(await db.collection("audit_logs").countDocuments({weddingId:new ObjectId(a.id),action})>0);
  await request(owner,`${base}/expenses/${expense.id}`,"DELETE",undefined,204);await request(owner,`${base}/expenses/${expense.id}`,"GET",undefined,404);
  // Vendor association alone blocks Event deletion after the Expense is removed.
  await request(owner,`${base}/events/${event.id}`,"DELETE",undefined,409);
  await request(owner,`${base}/vendors/${vendor.id}`,"DELETE",undefined,204);await request(owner,`${base}/vendors/${vendor.id}`,"GET",undefined,404);
  await request(owner,`${base}/events/${event.id}`,"DELETE",undefined,204);
  assert.deepEqual((await request(owner,`${base}/expenses/summary`)).data,{currency:"INR",estimatedTotalMinor:0,actualTotalMinor:0,varianceMinor:0});
  await request(owner,base,"PATCH",{currency:"USD"});
  console.info(`H7 smoke: ${checks} HTTP assertions passed; Vendor/Expense CRUD, safe dependencies, indexes/audits, role/tenant isolation and Expense-only financial totals verified.`);
} catch(error) {
  console.error(`H7 smoke FAILED during ${stage}. No credentials, cookies or raw errors printed.`);process.exitCode=1;
  if(typeof error?.actual==="number"&&typeof error?.expected==="number")console.error(`Expected ${error.expected}; received ${error.actual}.`);
} finally {
  try {if(db){const owned=await db.collection("weddings").find({createdBy:{$in:userIds}}).project({_id:1}).toArray();const ids=[...weddingIds,...owned.map(row=>row._id)];for(const name of ["vendors","expenses","audit_logs","events","wedding_memberships"]){await db.collection(name).deleteMany({weddingId:{$in:ids}});assert.equal(await db.collection(name).countDocuments({weddingId:{$in:ids}}),0);}await db.collection("weddings").deleteMany({_id:{$in:ids},createdBy:{$in:userIds}});await db.collection("organizations").deleteMany({createdBy:{$in:userIds}});await db.collection("sessions").deleteMany({userId:{$in:userIds}});await db.collection("users").deleteMany({_id:{$in:userIds}});console.info("H7 smoke: all disposable financial/domain/auth/audit data cleaned; intentional development data preserved.");}}catch{console.error(`H7 cleanup requires inspection for disposable run ${run}.`);process.exitCode=1;}
  await client?.close();
}
