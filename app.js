const express=require("express")
const mongoose=require("mongoose")
const dotenv=require("dotenv")

const categorieRouter=require("./routes/categorie.route")
const scategorieRouter =require("./routes/scategorie.route")
const articleRouter =require("./routes/article.route")
dotenv.config()
const app=express()
app.use(express.json())
app.get("/",(req,res)=>{
    res.send("bonjour")
})

// Connexion à la base données
mongoose.connect(process.env.DATABASECLOUD)
.then(() => {console.log("DataBase Successfully Connected");})
.catch(err => { console.log("Unable to connect to database", err);
process.exit(); });

app.use('/api/categorie', categorieRouter)
app.use('/api/scategories', scategorieRouter);
app.use('/api/articles', articleRouter);

app.listen(process.env.PORT, () => {
    console.log(`Server is listening on port ${process.env.PORT}`); 
});

module.exports = app;
    
