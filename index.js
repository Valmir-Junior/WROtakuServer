const express = require('express');
const pg = require('pg');
const port = process.env.PORT || 80;

const pool = new pg.Pool(
    {
        connectionString: "postgres://yeqwvgrjsxzfum:b72b0efde07ae4c2ad6cd310a4a36f03b41082cfc9d6cd11d9e5a404516a2e69@ec2-34-232-191-133.compute-1.amazonaws.com:5432/das1mo44ostlit",
        ssl: {
            rejectUnauthorized: false,
        }
    }
);

const app = express();
app.use(express.json());
app.set('port', port);

app.route('/reset').get((req, res)=>{
    let query = "DROP TABLE IF EXISTS content;";
    query+= "CREATE TABLE content (";
    query+= "	descricao varchar(100),";
    query+= "	dataPublicacao varchar(100),";
    query+= "	diaLancamento varchar(100),";
    query+= "	categoria varchar(100));";    


    query+= "DROP TABLE IF EXISTS app_user;";
    query+= "CREATE TABLE app_user (";
    query+= "	nome varchar(100),";
    query+= "	email varchar(100),";
    query+= "	password varchar(100));";
    query+= "INSERT INTO app_user (nome, email, password) VALUES ('CLIENTE1', 'teste@teste.com', '1212');";

    pool.query(query, (err, dbres)=>{
        if (err) {
            res.status(500).send(err);        
        } else {
            res.status(200).send('Reset do banco de dados resetado');  
        }
    });    
});

app.route('/conteudos/adicionar').post((req, res)=>{
    console.log('BODY:' , req.body);
    let qry = "INSERT INTO content (descricao, dataPublicacao, categoria, diaLancamento)";
    qry += " VALUES ($1, $2, $3, $4)";    
    pool.query(qry, [req.body.descricao, req.body.dataPublicacao, req.body.categoria, req.body.diaLancamento], (err, dbres) => {
        if (err) {
            res.status(500).send(err);        
        } else {
            res.status(200).send('Objeto adicionado com sucesso!');
        }
    });    
});

app.route('/conteudos/listar').get((req, res)=>{
    let qry = "SELECT * FROM content;";    
    pool.query(qry, (err, dbres)=>{
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).json(dbres.rows);
        }
    });    
});

app.listen(port, ()=>{
    console.log('Servidor Iniciado');
});