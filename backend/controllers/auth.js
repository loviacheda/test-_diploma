import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup =(req,res)=>{
    // check the existance of user
const q =" SELECT * FROM users WHERE email=?";


db.query(q, [req.body.email], (err,data)=> {
//db.query(q, [req.body.email, req.body.first_name, req.body.last_name], (err,data)=> {
    if (err) return res.json(err);
    if (data.length) return res.status(409).json("User already exists!");


    //hash the password and create user
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const q = "INSERT INTO users(`first_name`, `last_name`,`email`, `password`) VALUES(?)";
    const values = [req.body.firstName,req.body.lastName,req.body.email, hash ];

    

    db.query(q, [values], (err,data)=> {
        if (err) return res.json(err);
        // console.log(data.insertId)
        const user_id = data.insertId;
        const q = "INSERT INTO workspaces(`name`) VALUES('my_space')";
        db.query(q, (err,data)=> {
          if (err) return res.json(err);
          const workspace_id = data.insertId;
          const q = "INSERT INTO creating_workspace(`user_id`, `workspace_id`) VALUES(?)";
          const values = [user_id, workspace_id];
          db.query(q, [values], (err,data)=> {
            if (err) return res.json(err);
            return res.status(200).json ("User has been created!");
          });
        });
    });

    
});
};

export const login = (req,res)=>{

    const q = "SELECT * FROM users WHERE email = ?";
    db.query(q, [req.body.email], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("User not found!");
    
        //Check password
        const isPasswordCorrect = bcrypt.compareSync(
          req.body.password,
          data[0].password
        );
    
        if (!isPasswordCorrect)
          return res.status(400).json("Wrong username or password!");
    
        const token = jwt.sign({ id: data[0].id }, "jwtkey");
        const { password, ...other } = data[0];
    
        res
          .cookie("access_token", token, {
            httpOnly: true,
          })
          .status(200)
          .json(other);
      });
}

export const logout = (req,res)=>{
    
}