const express = require('express');
const pg = require('pg');
const port = process.env.PORT || 80;

const pool = new pg.Pool(
    {
        connectionString: "postgres://dquedxdbsxdhym:e99dcf9c2f6091dea9886445b412626741aff25aa7e40efead8a249eee09dab6@ec2-18-214-140-149.compute-1.amazonaws.com:5432/d2vmab9ogj41op",
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
    query+= "	id serial primary key not null,";
    query+= "	descricao varchar(100),";
    query+= "	sinopse varchar(200),";
    query+= "	dataPublicacao timestamp,";
    query+= "	diaLancamento int,";
    query+= "	categoria int,";
    query+= "	classificacao int,";
    query+= "	formato int,";
    query+= "	fkUsuario int);";


    query+= "DROP TABLE IF EXISTS app_user;";
    query+= "CREATE TABLE app_user (";
    query+= "	id serial primary key not null,";
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
    let qry = "INSERT INTO content (descricao, dataPublicacao, diaLancamento, categoria, classificacao, formato, fkUsuario) VALUES ";
    qry += "($1, $2, $3, $4, $5, $5, $6, $7)";
    pool.query(qry, [req.body.descricao, req.body.dataPublicacao, req.body.diaLancamento, req.body.categoria, req.body.classificacao, req.body.formato,req.body.fkUsuario], (err, dbres) => {
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
            res.status(200).json([dbres.rows]);
        }
    });    
});

app.listen(port, ()=>{
    console.log('Servidor Iniciado');
});