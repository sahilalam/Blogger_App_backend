require('dotenv').config();
const mongodb=require('mongodb');
const mongoClient=mongodb.MongoClient;
const db_url=process.env.DB_URL;
const db_name=process.env.DB_NAME;
const blogs_collection='blogs';
const users_collection='users';
const objectId=mongodb.ObjectId;

let addBlog=async(title,category,subject,body,date,image_url,email,name)=>{
    try{
        const client=await mongoClient.connect(db_url);
        const db=await client.db(db_name);
        const step1=await db.collection(blogs_collection).insertOne({
            name,title,category,subject,body,date,image_url,likes:0,comments:[]
        });
        let blog_id=step1.ops[0]._id;
        const step2=await db.collection(users_collection).updateOne({"email":email},{$push:{"blogs":blog_id}});
        client.close();

    }
    catch(err)
    {
        throw err;
    }

}
let getBlogs=async(offset,filter)=>{
    try{
        let n=10;
        const client=await mongoClient.connect(db_url);
        const db=await client.db(db_name);
        let f=[{}];
        if(filter)
        {
            if(filter.category)
            {
                f.push({
                    'category':{$eq:filter.category}
                });
            }
            if(filter.date)
            {
               
                f.push({
                    'data':{$gte:filter.date.from,$lte:filter.date.to}
                });
            }
            if(filter.myblogs)
            {
                f.push({
                    "_id":{
                        $in:filter.myblogs
                    }
                })
            }
        }
        const data=await db.collection(blogs_collection).find({$and:f}).project({"body":0}).sort({'likes':-1}).skip(offset).limit(n+1).toArray();
        client.close();
        let next=false,prev=false;
        if(data.length>n)
        {
            next=true;
        }
        if(offset>=10)
        {
            prev=true;
        }
        return {
            data,next,prev
        } 

    }
    catch(err){
        throw err;
    }
}
let getBlogByIds=async(ids)=>{
    try{
        const client=await mongoClient.connect(db_url);
        const db=await client.db(db_name);
        ids=ids.map((id)=>{
            return new objectId(id);
        });
        const data=await db.collection(blogs_collection).find({'_id':{
            $in:ids
        }}).project({"body":0}).sort({'date':-1}).toArray();
        client.close();
        return data;
    }
    catch(err)
    {
        throw err;
    }
}
let getBlogById=async(id)=>{
    try{
        const client=await mongoClient.connect(db_url);
        const db=await client.db(db_name);
        id=new objectId(id);
        const data=await db.collection(blogs_collection).findOne({'_id':{
            $eq:id
        }});
        client.close();
        return data;
    }
    catch(err)
    {
        throw err;
    }
}
module.exports={
    addBlog,getBlogs,getBlogByIds,getBlogById
}
