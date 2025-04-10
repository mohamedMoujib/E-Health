const Article = require('../models/Article');
const Doctor = require('../models/Doctor');


exports.createArticle = async (req, res) => {
    try {
        const idDoctor = req.user?.id;
        const {  categorie, titre, description, image } = req.body;
        if (!idDoctor || !categorie || !titre || !description) {
            return res.status(400).json({ message: 'Veuillez remplir tous les champs' });
        }

        const doctor = await Doctor.findById(idDoctor);
        if (!doctor) {
            return res.status(404).json({ message: 'Médecin non trouvé' });
        }

        const article = new Article({
            idDoctor,
            categorie,
            titre,
            description,
            image,
        });

        await article.save();
        res.status(201).json(article); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Récupérer tous les articles avec les informations du médecin
exports.getArticles = async (req, res) => {
    try {
        const articles = await Article.find()
        .populate({
            path: 'idDoctor',
            select: 'firstName lastName image',
            model: 'Doctor',
          });
        res.status(200).json(articles);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la récupération des articles", error: error.message });
    }
};

// Récupérer un article par son ID
exports.getArticleById = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id).populate('idDoctor','-password');

        if (!article) {
            return res.status(404).json({ message: 'Article non trouvé' });
        }

        res.status(200).json(article); // Retourner l'article trouvé
    } catch (error) {
        res.status(500).json({ message: error.message }); // Gérer les erreurs
    }
};

exports.updateArticle = async (req, res) => {
    try {
        const { titre, description, categorie, image } = req.body;
        
        // Mettre à jour l'article avec les nouvelles données
        const article = await Article.findByIdAndUpdate(
            req.params.id,
            { titre, description, categorie, image },
            { new: true } // Retourner l'article mis à jour
        );

        if (!article) {
            return res.status(404).json({ message: 'Article non trouvé' });
        }

        res.status(200).json(article); // Retourner l'article mis à jour
    } catch (error) {
        res.status(500).json({ message: error.message }); // Gérer les erreurs
    }
};

exports.deleteArticle = async (req, res) => {
    try {
        const article = await Article.findByIdAndDelete(req.params.id);

        if (!article) {
            return res.status(404).json({ message: 'Article non trouvé' });
        }

        res.status(200).json({ message: 'Article supprimé avec succès' }); // Confirmation de suppression
    } catch (error) {
        res.status(500).json({ message: error.message }); // Gérer les erreurs
    }
};

// Récupérer les articles d'un médecin
exports.getArticlesByDoctor = async (req, res) => {
    try {
        const articles = await Article.find({ idDoctor: req.params.idDoctor }).populate('idDoctor');

        if (!articles || articles.length === 0) {
            return res.status(404).json({ message: 'Aucun article trouvé pour ce médecin' });
        }

        res.status(200).json(articles); // Retourner les articles trouvés
    } catch (error) {
        res.status(500).json({ message: error.message }); // Gérer les erreurs
    }
};
exports.getMyArticles = async (req, res) => {
    try {
        const articles = await Article.find({ idDoctor: req.user?.id }).populate('idDoctor');

        if (!articles || articles.length === 0) {
            return res.status(404).json({ message: 'Aucun article trouvé pour ce médecin' });
        }

        res.status(200).json(articles); // Retourner les articles trouvés
    } catch (error) {
        res.status(500).json({ message: error.message }); // Gérer les erreurs
    }
};


// Récupérer les articles par catégorie
exports.getArticlesByCategorie = async (req, res) => {
    try {
        const articles = await Article.find({ categorie: req.params.categorie });

        if (!articles || articles.length === 0) {
            return res.status(404).json({ message: 'Aucun article trouvé pour cette catégorie' });
        }

        res.status(200).json(articles); // Retourner les articles trouvés
    } catch (error) {
        res.status(500).json({ message: error.message }); // Gérer les erreurs
    }
};
