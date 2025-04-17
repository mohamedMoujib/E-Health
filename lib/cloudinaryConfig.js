require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "profile_pictures",
        allowed_formats: ["jpg", "png", "jpeg"],
    },
});

const upload = multer({ storage });

// Storage for documents (PDFs and images)
const storageDocument = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        let resourceType = "auto"; // Par défaut, Cloudinary détecte le type
        if (file.mimetype === "application/pdf") {
            resourceType = "raw"; // Forcer "raw" pour les PDFs
        }

        return {
            folder: "documents",
            allowed_formats: ["jpg", "png", "jpeg", "pdf"],
            resource_type: resourceType,
        };
    }
});
const uploadDocument = multer({ storage: storageDocument });

// Storge for articles (images)
const storageArticle = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "articles",
        allowed_formats: ["jpg", "png", "jpeg"],
    },
});
const uploadArticle = multer({ storage: storageArticle });

//storage for messages (images)
const storageMessage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "messages",
        allowed_formats: ["jpg", "png", "jpeg"],
    },
});
const uploadMessage = multer({ storage: storageMessage });

module.exports = { cloudinary, upload, uploadDocument, uploadArticle,uploadMessage };
