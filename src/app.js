import express from 'express'
import cors from 'cors'
import pg from 'pg'
import joi from 'joi'

const app = express()

app.use(cors())

app.use(express.json())

const {Pool} = pg

const connection = new Pool({
    user: 'bootcamp_role',
    password: 'senha_super_hiper_ultra_secreta_do_role_do_bootcamp',
    host: 'localhost',
    port: 5432,
    database: 'boardcamp'
  })


  app.get("/categories" , async (req,res)=>{
    try{
        const result = await connection.query('SELECT * FROM categories')
        res.send(result.rows)
    }catch(e){
        console.log('Erro')
        console.log(e)
        res.sendStatus(500)
    }

  })

  app.post("/categories" , async (req,res)=>{

    const {name} = req.body

    if(!name){
        res.status(400).send('O nome da categoria não pode estar vazio')
        return
    }
    
    try{
        const result =  await connection.query(`SELECT * FROM categories WHERE name = $1`,[name])
        
        if(!result.rows.length){
            try{
                await connection.query(`INSERT INTO categories (name) VALUES ($1)`,[name])
                res.sendStatus(201)
            }catch(e){
                console.log('Erro ao salvar nova categoria no banco de dados')
                console.log(e)
                res.sendStatus(500)
            }
        }else{
            res.status(409).send('Categoria já existe')
        }

    }catch(e){
            console.log('Erro ao comparar se categoria já existe no banco de dados')
            console.log(e)
        }
    
    })



  app.listen(4000,()=>{
      console.log('server rodando na 4000')
  })