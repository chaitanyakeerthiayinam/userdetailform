const express = require('express');
const mongoose = require('mongoose');
const {body , validationResult} = require('express-validator');
const methodOverride = require('method-override');
const app = express();
mongoose.connect('mongodb+srv://test:test@cluster0.cbsakub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
const db = mongoose.connection;
db.on('error',console.error.bind(console, 'MongoDB connection error'));


const userSchema = new mongoose.Schema({
    name : String,
    age : Number,
    email : String
})
const User = mongoose.model('User',userSchema);

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(methodOverride('_method'));

app.use(express.static('public'));
app.set('view engine','ejs');




// Route to display the form for adding a new user
app.get('/user', async (req, res) => {
    try {
        const users = await User.find(); // Fetch users from the database
        res.render('user-details', { users }); // Pass the users array to the template
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/user/new', (req, res) => {
    res.render('new-user', { errors: null });
});


app.get("/user/:id/edit" , async (req,res)=>{
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('edit-user', { user, errors: null });
    } catch (error) {
        res.status(500).send(error);
    }
});


app.get("/user/:id" , async (req,res)=>{
    try{
        const user = await User.findById(req.params.id);
        if(!user){
            return res.status(404).send('User not found');
        }
        res.send(user);
    }catch(error){
        res.status(500).send(error);
    }
})

// Route to create a new user
app.post("/user" , [
    body('name').isLength({min:4}).withMessage('Name is required with min 4 chars'),
    body('age').isInt({min:18}).withMessage('Age must be a number greater than 18'),
    body('email').isEmail().withMessage('Invalid email Address')
], async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.render('new-user', {errors:errors.array()});
    }
    try{
        const user = new User(req.body);
        await  user.save();
        res.redirect('/user');
        
    }catch(error){
        res.status(500).send(error);
    }
})

const PORT = 3000;
app.listen(PORT , ()=>{
    console.log(`Server is running on port ${PORT}`);
})

