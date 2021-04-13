require('dotenv').config();
const mongodb=require('mongodb');
const mongoClient=mongodb.MongoClient;
const db_url=process.env.DB_URL;
const db_name=process.env.DB_NAME;
const likes_collection='likes';
const blogs_collection='blogs';
const objectId=mongodb.ObjectId;

let like=async(email,post_id)=>{
    try{
        const client=await mongoClient.connect(db_url);
        const db=await client.db(db_name);
        const step1=await db.collection(likes_collection).insertOne({
            email,post_id
        });
        const step2=await db.collection(blogs_collection).updateOne({'post_id':{$eq:new objectId(post_id)}},{$inc:{"likes":1}});
        client.close();
    }
    catch(err)
    {
        throw err;
    }
}
let dislike=async(email,post_id)=>{
    try{
        const client=await mongoClient.connect(db_url);
        const db=await client.db(db_name);
        const step1=await db.collection(likes_collection).deleteOne({$and:[{'email':email},{"post_id":post_id}]});
        const step2=await db.collection(blogs_collection).updateOne({'post_id':{$eq:new objectId(post_id)}},{$inc:{"likes":-1}});
        client.close();
    }
    catch(err){
        throw err;
    }
}
let checkLike=async(email,post_id)=>{
    try{
        const client=await mongoClient.connect(db_url);
        const db=await client.db(db_name);
        const data=await db.collection(likes_collection).findOne({$and:[{'email':email},{"post_id":post_id}]});
        client.close();
        if(data)
        {
            return true;
        }
        return false;
    }
    catch(err)
    {
        throw err;
    }
}
module.exports={
    like,dislike,checkLike
}