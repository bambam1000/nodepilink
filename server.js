const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer');
const pdf = require('html-pdf');
const cors = require('cors');
const fs = require('fs');  


const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.post('/submit-form', (req, res) => {
  const { nom, prenom, email, passport, delivreeLe, lieu, domicilie, tel } = req.body;

  const templatePath = path.join(__dirname, 'template.html'); // Chemin vers le fichier template.html

  // Lire le contenu du fichier template.html
  fs.readFile(templatePath, 'utf8', (err, templateContent) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Une erreur s'est produite lors de la lecture du template HTML.");
    }

    // Remplacer les variables dans le template avec les valeurs du formulaire
    const htmlTemplate = templateContent
      .replace('{{nom}}', nom)
      .replace('{{prenom}}', prenom)
      .replace('{{email}}', email)
      .replace('{{passport}}', passport)
      .replace('{{delivreeLe}}', delivreeLe)
      .replace('{{lieu}}', lieu)
      .replace('{{domicilie}}', domicilie)
      .replace('{{tel}}', tel)

      ;

    pdf.create(htmlTemplate, {
      format: 'A4',
      border: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      },
     
      footer: {
        height: '1cm',
        top: '2cm',
        contents: '<div style="text-align: center; font-size: 10px;">Accord de confidentialité </div>'
      }
    }).toFile('./template.pdf', (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Une erreur s'est produite lors de la génération du PDF.");
      }



      const transporter = nodemailer.createTransport({
        host: 'depro8.fcomet.com',
        port: 587,
        secure: false,
        auth: {
          user: 'accounts@meplace.org',
          pass: 'aWJ69BY8ZC5T',
        },
      });

      const mailOptions = {
        from: 'accounts@meplace.org',
        to: email,
        
        subject: 'accord de confidentialité de pilink pour le test de recrutement de naoussi talla leo martial ',
        text: 'Veuillez trouver ci-joint accord de confidentialité de PILINK au format PDF.',
        attachments: [
          {
            filename: 'template.pdf',
            path: './template.pdf',
          },
        ],
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(500).send("Une erreur s'est produite lors de l'envoi de l'email.");
        }

        res.json({ message: 'Le formulaire a été envoyé par email avec succès verifier votre boite mail sans oublier les spam ' });
      });
    });
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Le serveur est en cours d'exécution sur le port ${port}.`);
});
