const express = require('express');
const pg = require('pg');
const config = require('config');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || config.get('server.port');;
const dbUrl = process.env.DATABASE_URL || config.get('db.url');
const secret = process.env.JWT_SECRET || config.get('jwt.secret');

const pool = new pg.Pool(
    {
        connectionString: dbUrl,
        ssl: {
            rejectUnauthorized: false,
        }
    }
);

const filtroJwt = (req, res, proximo) => { 
    console.log("Headers ==>", req.headers);
    if (req.headers.authorization 
        && req.headers.authorization.substring(0, 6) === "Bearer") { 
        const token = req.headers.authorization.substring(7);
        console.log("Token ==> ", token);
        jwt.verify(token, secret, (err, info) => { 
            if (err) { 
                res.status(403).send("Token inválido");
            } else { 
                proximo();
            }
        });
    } else { 
        res.status(403).send("É necessário um token para acessar este recurso")
    }
}

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

app.route('/conteudos/adicionar').post(filtroJwt, (req, res)=>{
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

app.route('/conteudos/listar').get(filtroJwt, (req, res)=>{
    let qry = "SELECT * FROM content;";    
    pool.query(qry, (err, dbres)=>{
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).json(dbres.rows);
        }
    });    
});

app.route('/forums/adicionar').post(filtroJwt, (req, res)=>{
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

app.route('/forums/listar').get(filtroJwt, (req, res)=>{
    let qry = "SELECT * FROM forum;";    
    pool.query(qry, (err, dbres)=>{
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).json(dbres.rows);
        }
    });    
});

app.route('/config/adicionar').post(filtroJwt, (req, res)=>{
    console.log('BODY:' , req.body);
    let qry = "";
    if (req.body.operation === "1"){
        qry = "INSERT INTO config (modo, ocultarConteudo, confirmarAcesso)";
        qry += " VALUES ($1, $2, $3)";
    } else {
        qry = "UPDATE config SET modo=$1 , ocultarConteudo=$2, confirmarAcesso=$3;";
    }

    pool.query(qry, [req.body.modo, req.body.ocultarConteudo, req.body.confirmarAcesso], (err, dbres) => {
        if (err) {
            res.status(500).send(err);        
        } else {
            res.status(200).send('Objeto adicionado com sucesso!');
        }
    });    
});

app.route('/config/buscar').get(filtroJwt, (req, res)=>{
    let qry = "SELECT * FROM config;";    
    pool.query(qry, (err, dbres)=>{
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).json(dbres.rows);
        }
    });    
});

app.route('/forum_chat/adicionar').post(filtroJwt, (req, res)=>{
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

app.route('/forum_chat/listar').get(filtroJwt, (req, res)=>{
    let qry = "SELECT * FROM forumchat;";    
    pool.query(qry, (err, dbres)=>{
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).json(dbres.rows);
        }
    });    
});

app.route('/login').post((req, res)=>{
    console.log('Body', req.body);
    let qry = "SELECT * FROM app_user where email=$1 and password=$2;";    
    pool.query(qry, [req.body.email, req.body.password], (err, dbres)=>{
        if (err) {
            res.status(500).send(err);
        } else {
            if (dbres.rowCount > 0) {
                const row = dbres.rows[0];
                const payload = {
                    nomeUsuario: row.nome
                };
                const token = jwt.sign(payload, secret);
                const responseObj = {token}
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