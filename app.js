const express=require("express")
const mongoose=require("mongoose")
const dotenv=require("dotenv")

const categorieRouter=require("./routes/categorie.route")
const scategorieRouter =require("./routes/scategorie.route")
const articleRouter =require("./routes/article.route")
const userRouter =require("./routes/user.route")
const cors =require("cors")

dotenv.config()
const app=express()
app.use(express.json())
app.get("/",(req,res)=>{
    res.send("bonjour")
})

// Connexion à la base données
mongoose.connect(process.env.DATABASE)
.then(() => {console.log("DataBase Successfully Connected");})
.catch(err => { console.log("Unable to connect to database", err);
process.exit(); });

app.use(cors());
app.use('/api/categorie', categorieRouter)
app.use('/api/scategories', scategorieRouter);
app.use('/api/articles', articleRouter);
app.use('/api/user' , userRouter)
app.listen(process.env.PORT, () => {
    console.log(`Server is listening on port ${process.env.PORT}`); 
});

module.exports = app;
    
