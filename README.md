<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="stylesheet" href='https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css'/>
</head>
<body>

<img src='http://patatalouis.fr/static/img/logo_gitlab.png'>


<h2 class="row justify-content-center"> Présentation </h2>
<i style='font-size : 13px'> 
	JAUSEAU Baptiste P1509933 <br>
	OLIVIE Maxime P1710179
</i>
<br> <br>

<p> 
	DataViz a été créé dans le cadre de l'UE LIFPROJET, à l' UCBL Lyon1 <br>
	C'est une application Web permettant de visualiser des données de 	pollution,<br>
	de l'an 1975 à 2014, par pollution totale, par habitant, ainsi que par pays ou bien par continent.
</p>		

<p> 
	Nous avons porté un soin particulier à la présentation générale et au design de l'application. <br>
	Le but est de la rendre accessible le plus vite possible et facile à utiliser. <br>
	Le site de l'application est donc accessible et hébergé sur un serveur distant mutualisé, 	<br>
	et est visionnable sur Téléphone, ordinateur, ou bien tablette.
</p>

<h2 class='row justify-content-center'>  Accés à l'application </h2>

<h5> <u>Première Méthode :</u> </h5> <br>
<p>
	La plus simple, est simplement d'accéder à l'application via le lien suivant : 
	<a href='http://lifprojet.patatalouis.fr'> <u>  Cliquez ici ! </u> </a>  <br>
	Cela vous affranchira d'une étape fastidieuse d'installation des différentes dépendances,<br>
	nombreuses pour ce projet.
</p>	

<h5> <u>Seconde Méthode :</u> </h5> <br>
<p>
	Il va vous falloir installer toutes les dépendances vous-mêmes : <br>
	Tout d'abord, nous avons besoin d'un serveur MySql, plus précisément son fork, MariaDB.
	Il peut être installé comme suivant :
	<pre>	$ sudo apt install mariadb-server    <i>(Unix)</i> </pre>
	<pre>	$ brew install mariadb    <i>(Mac)</i> </pre>
	Puis, ensuite nous aurons besoin d'un serveur Node.js et son outil NPM, <br>
	Le lien suivant vous indiquera la procédure a suivre : <a href="https://tecadmin.net/install-latest-nodejs-npm-on-ubuntu/"><u>Installation Node.js</u></a> <br>
	<i> Veillez à bien vous procurer la version 12 ou supérieure de Node</i>
	<br><br>
	Ensuite, il vous faut peupler la base de données, pour ce ceci, aprés avoir cloné la branche master du projet, importez dans votre BDD le fichier insertion.sql, présent dans le répertoire /sql.
	<br> <br>
	A la racine du projet, crééz un fichier .env basé sur <a href='http://patatalouis.fr/static/base_env.txt'><u>Ce modèle</u></a> et adaptez le à votre environnement de bases de données. les variables 'user' et 'password' définissent vos identifiants de connection choisis dans votre serveur mysql. Modifiez-les en conséquence
	<br>
	Ensuite, importons tous les modules Node.js avec : <br><br>
	<pre> $ npm install </pre> 
	Et ensuite
	<pre> $ npm install --save-dev </pre>
	Nous "démarrons" l'écoute du serveur node avec la commande suivante : <br>
	<pre> $ npm start </pre>
	Enfin, Ouvrez votre navigateur favori et saisissez localhost:8080 dans votre barre d'addresse.<br>
	Si tout va bien, vous devriez voir le site s'afficher.<br>
	Si ça n'est pas le cas, vous pouvez nous contacter par mail : <br>
	<a HREF="mailto:maxime.olivie@etu.univ-lyon1.fr"> <u> mail pb technique</u> </a>
	
	
</p>




    
    
</body>
</html>