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
    
    
    query+= "DROP TABLE IF EXISTS forum;";
    query+= "CREATE TABLE forum (";
    query+= "	nome varchar(50),";
    query+= "   dataCriacao varchar(20),";
    query+= "   categoria varchar(5));";

    query+= "DROP TABLE IF EXISTS config;";
    query+= "CREATE TABLE config (";
    query+= "	modo varchar(10),";
    query+= "   ocultarConteudo varchar(3),";
    query+= "   confirmarAcesso varchar(3));";

    query+= "DROP TABLE IF EXISTS forumchat;";
    query+= "CREATE TABLE forumchat (";
    query+= "	mensagem varchar(100),";
    query+= "   typeMessage varchar(1),";
    query+= "   origem varchar(50));";


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

app.route('/forums/adicionar').post((req, res)=>{
    console.log('BODY:' , req.body);
    let qry = "INSERT INTO forum (nome, dataCriacao, categoria)";
    qry += " VALUES ($1, $2, $3)";    
    pool.query(qry, [req.body.nome, req.body.dataCriacao, req.body.categoria], (err, dbres) => {
        if (err) {
            res.status(500).send(err);          
        } else {
            res.status(200).send('Objeto adicionado com sucesso!');
        }
    });    
});

app.route('/forums/listar').get((req, res)=>{
    let qry = "SELECT * FROM forum;";    
    pool.query(qry, (err, dbres)=>{
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).json(dbres.rows);
        }
    });    
});

app.route('/config/adicionar').post((req, res)=>{
    console.log('BODY:' , req.body);
    if (req.body.operation === "1"){
        let qry = "INSERT INTO config (modo, ocultarConteudo, confirmarAcesso)";
        qry += " VALUES ($1, $2, $3)";
    } else {
        let qry = "UPDATE config SET modo=$1 , ocultarConteudo=$2, confirmarAcesso=$3;";
    }   
    pool.query(qry, [req.body.modo, req.body.ocultarConteudo, req.body.confirmarAcesso], (err, dbres) => {
        if (err) {
            res.status(500).send(err);        
        } else {
            res.status(200).send('Objeto adicionado com sucesso!');
        }
    });    
});

app.route('/config/buscar').get((req, res)=>{
    let qry = "SELECT * FROM config;";    
    pool.query(qry, (err, dbres)=>{
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).json(dbres.rows);
        }
    });    
});

app.route('/forum_chat/adicionar').post((req, res)=>{
    console.log('BODY:' , req.body);
    let qry = "INSERT INTO forumchat (mensagem, typeMessage, origem)";
    qry += " VALUES ($1, $2, $3)";    
    pool.query(qry, [req.body.mensagem, req.body.typeMessage, req.body.origem], (err, dbres) => {
        if (err) {
            res.status(500).send(err);        
        } else {
            res.status(200).send('Objeto adicionado com sucesso!');
        }
    });    
});

app.route('/forum_chat/listar').get((req, res)=>{
    let qry = "SELECT * FROM forumchat;";    
    pool.query(qry, (err, dbres)=>{
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).json(dbres.rows);
        }
    });    
});

app.route('/login').get((req, res)=>{
    console.log('Body', req.body);
    let qry = "SELECT * FROM app_user where email=$1 and password=$2;";    
    pool.query(qry, [req.body.email, req.body.password], (err, dbres)=>{
        if (err) {
            res.status(500).send(err);
        } else {
            if (dbres.rowCount > 0) {
                const row = dbres.rows[0];
                const responseObj = {
                    nomeUsuario: row.nome
                };
                res.status(200).json(responseObj);
            } else {
                res.status(401).send('Usuário ou senha não encontrados');
            }            
        }
    });    
});

app.route('/user/adicionar').post((req, res)=>{
    console.log('BODY:' , req.body);
    let qry = "INSERT INTO app_user (nome, email, password)";
    qry += " VALUES ($1, $2, $3)";    
    pool.query(qry, [req.body.nome, req.body.email, req.body.password], (err, dbres) => {
        if (err) {
            res.status(500).send(err);        
        } else {
            res.status(200).send('Objeto adicionado com sucesso!');
        }
    });    
});

app.listen(port, ()=>{
    console.log('Servidor Iniciado');
});