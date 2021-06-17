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

/***********************************--------------Games------------------------ */
    app.get("/games" , async (req,res)=>{
        try{
            const result = await connection.query('SELECT * FROM games')
            res.send(result.rows)
        }catch(e){
            console.log('Erro')
            console.log(e)
            res.sendStatus(500)
        }
    
      })


      app.post("/games" , async (req,res)=>{

        const {categoryId,name,image,stockTotal,pricePerDay} = req.body

        try{
            const result = await connection.query(`SELECT * FROM categories WHERE id = $1`,[categoryId])
            //console.log(result)
                if(result.rows.length){
                    
                     const userSchema = joi.object(
                        {
                            name: joi.string().min(1).required()
                            .messages({
                                // 'string.base': `"name" should be a type of 'text'`,
                                'string.empty': `"name" não pode estar vazio`,
                                'any.required': `"name" is a required field`
                            }),
                            image: joi.string().pattern(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/),
                            stockTotal: joi.number().positive().integer().required()
                            .messages({
                                'number.base': `"stockTotal" deve ser do tipo 'number'`,
                                'number.empty': `"stockTotal" não pode estar vazio`,
                                'number.positive': `"stockTotal" tem que ser maior do que zero`,
                                'any.required': `"stockTotal" is a required field`
                            }),
                            categoryId: joi.number().positive().required(),
                            pricePerDay: joi.number().positive().required()
                            .messages({
                                'number.base': `"pricePerDay" deve ser do tipo 'number'`,
                                'number.empty': `"pricePerDay" não pode estar vazio`,
                                'number.positive': `"pricePerDay" tem que ser maior do que zero`,
                                'any.required': `"pricePerDay" is a required field`
                            })
                        })


                    const validateNewGame = userSchema.validate(req.body)
                        
                        if(validateNewGame.error){
                            //console.log('nao pode')
                            res.status(400).send(validateNewGame.error.details[0].message)
                            return
                        }else{
                            //console.log(' pode')
                            try{
                                await connection.query(`INSERT INTO games (name,image,stockTotal,categoryId,pricePerDay) VALUES ($1,$2,$3,$4,$5)`,[name,image,stockTotal,categoryId,pricePerDay])
                                res.sendStatus(200)
                            }catch(e){
                                console.log('Erro ao salvar jogo novo no banco de dados')
                                console.log(e)
                                res.sendStatus(500)
                            }
                            
                        }
                                
                         
                   
                }else{
                    res.status(400).send('categoria não existe')
                    return
                }
            
        }catch(e){
            console.log('Erro ao procurar categoria do jogo novo')
            console.log(e)
        }

        
        
        
        
        // const userSchema = joi.object(
        //     {
        //         name: joi.string().min(1).required()
        //         .messages({
        //            // 'string.base': `"name" should be a type of 'text'`,
        //             'string.empty': `"name" não pode estar vazio`,
        //             'any.required': `"name" is a required field`
        //         }),
        //         image: joi.string().pattern(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/)
        //         ,
        //         pricePerDay: joi.number().positive().integer().required()
        //         .messages({
        //             'number.base': `"stockTotal" deve ser do tipo 'number'`,
        //             'number.empty': `"stockTotal" não pode estar vazio`,
        //             'number.positive': `"stockTotal" tem que ser maior do que zero`,
        //             'any.required': `"stockTotal" is a required field`
        //         }),
        //         categoryId: joi.number().positive().required(),
        //         pricePerDay: joi.number().positive().required()
        //         .messages({
        //             'number.base': `"pricePerDay" deve ser do tipo 'number'`,
        //             'number.empty': `"pricePerDay" não pode estar vazio`,
        //             'number.positive': `"pricePerDay" tem que ser maior do que zero`,
        //             'any.required': `"pricePerDay" is a required field`
        //         })
        //       }
        //     )

        //   const validateNewGame = userSchema.validate(req.body)
        //   console.log(validateNewGame)   
          
        //   if(validateNewGame.error){
        //       console.log('nao pode')
        //       res.status(400).send(validateNewGame.error.details[0].message)
        //   }else{
        //       console.log(' pode')
              
        //   }
    
        
        
        
        
        
        // if(!name){
        //     res.status(400).send('O nome do jogo não pode estar vazio')
        //     return
        // }
        
        // try{
        //     const result =  await connection.query(`SELECT * FROM games WHERE name = $1`,[name])
            
        //     if(!result.rows.length){
        //         try{
        //             await connection.query(`INSERT INTO games (name) VALUES ($1)`,[name])
        //             res.sendStatus(201)
        //         }catch(e){
        //             console.log('Erro ao salvar novo jogo no banco de dados')
        //             console.log(e)
        //             res.sendStatus(500)
        //         }
        //     }else{
        //         res.status(409).send('Jogo já existe')
        //     }
    
        // }catch(e){
        //         console.log('Erro ao comparar se jogo já existe no banco de dados')
        //         console.log(e)
        //     }
        
        })
    



  app.listen(4000,()=>{
      console.log('server rodando na 4000')
  })