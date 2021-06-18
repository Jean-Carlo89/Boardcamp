import express from 'express'
import cors from 'cors'
import pg from 'pg'
import joi from 'joi'
import dayjs from 'dayjs'

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
        
       
        const {name} = req.query


        if(name){
            
            
        try{
            const result = await connection.query(`
            SELECT games.* , categories.name AS "categoryName"
            FROM games JOIN categories
            ON games."categoryId" = categories.id
            WHERE games.name ILIKE $1
            
            `,[`%${name}%`])

            
            res.send(result.rows)
        }catch(e){
            console.log('Erro')
            console.log(e)
            res.sendStatus(500)
        }

        }else{
            
        
        
        try{
            const result = await connection.query(`
            SELECT games.* , categories.name AS "categoryName"
            FROM games JOIN categories
            ON games."categoryId" = categories.id
            
            `)
            res.send(result.rows)
        }catch(e){
            console.log('Erro')
            console.log(e)
            res.sendStatus(500)
        }
        }
    
      })


      app.post("/games" , async (req,res)=>{

            const {categoryId,name,image,stockTotal,pricePerDay} = req.body

            try{
                const categoryTest = await connection.query(`SELECT * FROM categories WHERE id = $1`,[categoryId])
                const categoryExist = categoryTest.rows.length
                const gameTest = await connection.query(`SELECT * FROM games WHERE name = $1`,[name])
                
                const gameAlreadyExist = gameTest.rows.length
                
                
                    if(!categoryExist){
                        res.status(400).send('categoria não existe')
                        return
                    }

                    if(gameAlreadyExist){
                        res.status(409).send("jogo já cadastrado")
                        return
                    }

                        
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
                                
                                res.status(400).send(validateNewGame.error.details[0].message)
                                return
                            }else{
                               
                                try{
                                    await connection.query(`INSERT INTO games (name,image,"stockTotal","categoryId","pricePerDay") VALUES ($1,$2,$3,$4,$5)`,[name,image,stockTotal,categoryId,pricePerDay])
                                    res.sendStatus(200)
                                }catch(e){
                                    console.log('Erro ao salvar jogo novo no banco de dados')
                                    console.log(e)
                                    res.sendStatus(500)
                                }
                                
                            }
                                    
                            
                    
                    
                
            }catch(e){
                console.log('Erro ao procurar categoria do jogo novo')
                console.log(e)
            }
        
        })
 /*-----------------------------Customers--------------------------*/
 
        app.get("/customers", async(req,res)=>{
            
                const {cpf} = req.query


            if(cpf){
                
                
            try{
                const result = await connection.query(`
                SELECT * 
                FROM customers
                WHERE customers.cpf LIKE $1
                
                `,[`%${cpf}%`])

                
                res.send(result.rows)
            }catch(e){
                console.log('Erro')
                console.log(e)
                res.sendStatus(500)
            }

            }else{
                
                try{
                    const allCustomers = await connection.query(`SELECT * FROM customers`)
                    allCustomers.rows.forEach((customer)=>{
                        customer.birthday=dayjs(customer.birthday).format('DD-MM-YYYY')
                    })
                    res.send(allCustomers.rows)
                }catch(e){
                    console.log('Erro ao pegar a lista de clientes')
                    console.log(e)
                } 
                
            }
        })

        app.get("/customers/:id", async(req,res)=>{
               
                const {id} = req.params
               
               
               try{
                    const customer = await connection.query(`
                    SELECT * FROM customers
                    WHERE id = $1
                    `,[id])

                    if(customer.rows.length){
                        customer.rows[0].birthday=dayjs(customer.rows[0].birthday).format('DD-MM-YYYY')
                        
                    res.send(customer.rows[0])
                    }else{
                        res.sendStatus(404)
                    }
               }catch(e){
                console.log('Erro ao procurar o cliente especificado')
                console.log(e)
               }

              

        })


        

        app.put("/customers/:id", async(req,res)=>{

            const validate = validateCustomer(req.body)

            const{name,phone,cpf,birthday} = req.body

            const {id}  = req.params
           
            try{    
                const cpfSearch = await connection.query(`
                SELECT customers.cpf FROM customers
                WHERE cpf = $1`,[cpf])
    
                
                if(cpfSearch.rows[0]){
                    res.sendStatus(409)
                    return
                }
                
    
            }catch(e){
                console.log('Erro ao obter cpf dos clientes')
                console.log(e)
            }
           
            
            if(validate.error){
               
                res.status(400).send(validate.error.details[0].message)
            }else{
               
                try{
                    await connection.query(`
                    UPDATE customers
                    SET name = $1,
                        phone = $2,
                        cpf = $3,
                        birthday = $4
                    WHERE id = $5
                    `,[name,phone,cpf,birthday,id])

                    res.sendStatus(200)
                }catch(e){
                    console.log('erro ao atualizar dados de cliente')
                    console.log(e)
                    res.send(e)
                }
            }
                
        })


        app.post("/customers", async(req,res)=>{
            
           
            
            req.body.birthday=dayjs(req.body.birthday).format('DD-MM-YYYY')
           
            const userSchema = joi.object(

                {
                    name: joi.string().min(1)
                     .messages({
                        // 'string.base': `"name" should be a type of 'text'`,
                        'string.empty': `"name" não pode estar vazio`,
                        'any.required': `"name" is a required field`
                        }),
                    phone: joi.string().min(10).max(11).pattern(/^[0-9]*$/)
                        .messages({
                            'string.min': '"phone" tem que ter no mínimo 10 números',
                            'string.pattern.base' : '"phone" deve conter somente números',
                            'string.max': '"phone" deve conter no máximo 11 números'
                        }),
                    cpf: joi.string().pattern(/^[0-9]{11}$/)
                        .messages({
                            'string.pattern.base' : '"cpf" deve ser composto de anpm install -g moment --save penas números e ter 11 caracteres',   
                        }),
                    birthday: joi.date()
                        .messages({
                            'date.base': '"birthday" deve ser data válida',
                            
                        })
                  }
            )

            const validateNewUser = userSchema.validate(req.body)
            const{name,phone,cpf,birthday} = req.body

            try{    
                const cpfSearch = await connection.query(`
                SELECT customers.cpf FROM customers
                WHERE cpf = $1`,[cpf])

              
                if(cpfSearch.rows[0]){
                    res.sendStatus(409)
                    return
                }
                

            }catch(e){
                console.log('Erro ao obter cpf dos clientes')
                console.log(e)
            }

            if(validateNewUser.error){
                
               // res.status(400).send(validateNewUser.error)
                res.status(400).send(validateNewUser.error.details[0].message)
                return
            }else{
                
                try{
                    await connection.query(`INSERT INTO customers (name,phone,cpf,birthday) VALUES ($1,$2,$3,$4)`,[name,phone,cpf,birthday])
                    res.sendStatus(200)
                }catch(e){
                    console.log('Erro ao salvar cliente novo no banco de dados')
                    console.log(e)
                    res.sendStatus(500)
                }
                
            }
        })

       
        
    /*-------------------------------------Rentals------------------------*/

        app.get("/rentals" ,async(req,res)=>{

            
           

            if(req.query["customerId"]){
                try{
                    const customerRental = await connection.query(`
                    SELECT rentals.*,
                    jsonb_build_object('name', customers.name, 'id', customers.id) AS customer,
                    jsonb_build_object('id', games.id, 'name', games.name, 'categoryId',
                    games."categoryId", 'categoryName', categories.name) AS game
                    FROM rentals
                    JOIN customers ON rentals."customerId" = customers.id 
                    JOIN games ON rentals."gameId" = games.id
                    JOIN categories ON categories.id = games."categoryId"
                    WHERE customers.id = $1
                    `,[req.query.customerId])

                    customerRental.rows.forEach((rental)=>{
                        rental.rentDate = dayjs(rental.rentDate).format('DD-MM-YYYY')
                    })
    
                    res.send(customerRental.rows)
                       return
                   }catch(e){
                       res.send('erro')
                       console.log(e)
                   }
               }

               if(req.query["gameId"]){
                try{
                    const customerRental = await connection.query(`
                    SELECT rentals.*,
                    jsonb_build_object('name', customers.name, 'id', customers.id) AS customer,
                    jsonb_build_object('id', games.id, 'name', games.name, 'categoryId',
                    games."categoryId", 'categoryName', categories.name) AS game
                    FROM rentals
                    JOIN customers ON rentals."customerId" = customers.id 
                    JOIN games ON rentals."gameId" = games.id
                    JOIN categories ON categories.id = games."categoryId"
                    WHERE games.id = $1
                    `,[req.query.gameId])

                    customerRental.rows.forEach((rental)=>{
                        rental.rentDate = dayjs(rental.rentDate).format('DD-MM-YYYY')
                    })
    
                    res.send(customerRental.rows)
                       return
                   }catch(e){
                       res.send('erro')
                       console.log(e)
                   }
               }
               
               
               
               
               
               /*---GETTAR TUDO------------------*/
            try{
                const rentals = await connection.query(`
                SELECT rentals.*, 
            jsonb_build_object('name', customers.name, 'id', customers.id) AS customer,
            jsonb_build_object('id', games.id, 'name', games.name, 'categoryId', 
            games."categoryId", 'categoryName', categories.name) AS game            
            FROM rentals 
            JOIN customers ON rentals."customerId" = customers.id
            JOIN games ON rentals."gameId" = games.id
            JOIN categories ON categories.id = games."categoryId"
            
                `)

                rentals.rows.forEach((rental)=>{
                    rental.rentDate = dayjs(rental.rentDate).format('DD-MM-YYYY')
                })



               
                
                res.send(rentals.rows)
                //res.send(rentals.rows)
            }catch(e){
                console.log('Erro ao pegar os aluguéis cadastrados')
                console.log(e)
            }

        })

        
        app.post("/rentals", async(req,res)=>{
           
           /*checking client*/
            try{
                const checkClient = await connection.query(`
                SELECT *
                FROM customers
                WHERE id = $1
                `,[req.body.customerId])

                if(!checkClient.rows.length){
                    res.sendStatus(400)
                    return
                }
              
            }catch(e){
                console.log(e)
                return
            }


            try{
                const checkGame = await connection.query(`
                SELECT *
                FROM games
                WHERE id = $1
                `,[req.body.gameId])

                //res.send(checkGame)

                if(!checkGame.rows.length){
                    res.sendStatus(400)
                    return
                }

              
            }catch(e){
                console.log(e)
                return
            }
           
           
           
           
            req.body.rentDate = dayjs().format('DD-MM-YYYY')
           
           

            req.body.returnDate=null

                try{
                    const price = await connection.query(`
                    SELECT games."pricePerDay" FROM games
                    WHERE id = $1
                    
                    `,[req.body.gameId])
                    
                    req.body.originalPrice = (price.rows[0].pricePerDay)*req.body.daysRented
                   
                }catch(e){
                    console.log('Erro ao pesquisar jogo')
                    console.log(e)
                }

                req.body.delayFee = null

                const userSchema = joi.object(

                        {
                        daysRented: joi.number().integer().positive(),
                        customerId:joi.number().integer().positive(),
                        rentDate:joi.string(),
                        gameId:joi.number().integer().positive(),
                        returnDate:joi.allow(null),
                        originalPrice:joi.number().integer().positive(),
                        delayFee: joi.allow(null)
                        })  

                const validateNewRental = userSchema.validate(req.body)

                if(validateNewRental.error){
                    res.status(400).send(validateNewRental.error.details[0].message)
                    return
                }else{
                    
                    const{daysRented,customerId,rentDate,gameId,returnDate,originalPrice,
                        delayFee} = req.body
                   try{
                        await connection.query(`
                        INSERT INTO rentals
                        ("daysRented","customerId","rentDate","gameId","returnDate",
                        "originalPrice","delayFee") 
                        VALUES ($1,$2,$3,$4,$5,$6,$7)
                        `,[daysRented,customerId,rentDate,gameId,returnDate,originalPrice,delayFee])

                        res.sendStatus(200)
                   }catch(e){
                       console.log('Erro ao registrar aluguel')
                       console.log(e)
                   }

                    
                }
            
        }) 





        app.post("/rentals/:id/return", async(req,res)=>{

            try{

                const returnTarget = await connection.query(`
                SELECT * FROM rentals WHERE id = $1
                `,[req.params.id])

                const {rentDate,daysRented} = returnTarget.rows[0]
                
                const today = dayjs().format("DD-MM-YYYY");
               
                
              
               
               const d = new Date(2021,5,20)
               const day = dayjs(d).format("DD-MM-YYYY")
               
               
               //const lateDays = dayjs(today).diff(rentDate, "day") - daysRented;
               const lateDays = dayjs(day).diff(dayjs(rentDate).format('DD-MM-YYYY'),"day")
               
             
                
               res.send(returnTarget.rows)
                return
                
            }catch(e){
                console.log('Erro ao retornar o jogo')
                console.log(e)
            }

        })

        app.delete("/rentals/:id" , async(req,res)=>{

            
            try{
                const checkRentalId = await connection.query(`
                SELECT * FROM rentals WHERE id = $1
                `,[req.params.id])

                if(!checkRentalId.rows.length){
                    res.status(404).send('Este aluguel não existe')
                    return
                }

                // if(checkRentalId.rows[0].returnDate!==null){
                //     res.status(400)
                // }

                try{
                    await connection.query(`
                    DELETE FROM rentals WHERE id = $1 
                    
                `,[req.params.id])

                res.sendStatus(200)

                }catch(e){
                    console.log('Erro ao excluir aluguel')
                    console.log(e)
                }


               
            }catch(e){
                console.log(e)
            }
        })
        
    /***********8------------------------------Functions
     * --------------------*/


     function validateCustomer(body){
        body.birthday=dayjs(body.birthday).format('DD-MM-YYYY')
        
        const userSchema = joi.object(

            {
                name: joi.string().min(1)
                 .messages({
                    // 'string.base': `"name" should be a type of 'text'`,
                    'string.empty': `"name" não pode estar vazio`,
                    'any.required': `"name" is a required field`
                    }),
                phone: joi.string().min(10).max(11).pattern(/^[0-9]*$/)
                    .messages({
                        'string.min': '"phone" tem que ter no mínimo 10 números',
                        'string.pattern.base' : '"phone" deve conter somente números',
                        'string.max': '"phone" deve conter no máximo 11 números'
                    }),
                cpf: joi.string().pattern(/^[0-9]{11}$/)
                    .messages({
                        'string.pattern.base' : '"cpf" deve ser composto de apenas números e ter 11 caracteres',   
                    }),
                birthday: joi.date()
                    .messages({
                        'date.base': '"birthday" deve ser data válida',
                        
                    })
              }
        )

        const validateNewUser = userSchema.validate(body)
        
        return validateNewUser
    }

  app.listen(4000,()=>{
      console.log('server rodando na 4000')
  })