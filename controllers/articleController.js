const Article = require('../models/Article');
const Doctor = require('../models/Doctor');


exports.createArticle = async (req, res) => {
    try {
        const idDoctor = req.user?.id;
        
        // Handle both form-data and JSON
        const { categorie, titre, description } = req.body;
        
        if (!idDoctor || !categorie || !titre || !description) {
            return res.status(400).json({ message: 'Veuillez remplir tous les champs' });
        }

        // Handle file upload
        let image = null;
        if (req.file) {
            // Use proper path handling for cross-platform compatibility
            image = req.file.path.replace(/\\/g, '/'); // Convert Windows paths to forward slashes
        }

        const doctor = await Doctor.findById(idDoctor);
        if (!doctor) {
            // Clean up uploaded file if doctor not found
            if (req.file) fs.unlinkSync(req.file.path);
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
        // Clean up uploaded file on error
        if (req.file) fs.unlinkSync(req.file.path);
        console.error("Error creating article:", error);
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
        console.log("Update article data:", req.body);
        console.log("Update article files:", req.file);
        
        const updateData = {
            titre: req.body.titre,
            description: req.body.description,
            categorie: req.body.categorie
            
        };
        
        // Only update image if a new one was uploaded
        if (req.file ) {
            const image = req.file.path.replace(/\\/g, '/'); // Convert Windows paths to forward slashes
           updateData.image = image;
        }
        
        // Mettre à jour l'article avec les nouvelles données
        const article = await Article.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!article) {
            return res.status(404).json({ message: 'Article non trouvé' });
        }

        res.status(200).json(article);
    } catch (error) {
        console.error("Error updating article:", error);
        res.status(500).json({ message: error.message });
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
