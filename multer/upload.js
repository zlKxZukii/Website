import fs from "fs";
import path from "path";
import multer from "multer";
import e from "express";

class FollowUploadService {
    constructor() {
        // es wird überprüft ob die DIR existiert. Falls nicht wird diese erstellt.
        const tempDir = 'uploads/temp';
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        this.storage = multer.diskStorage({
            destination: (req,file, cb) =>{
                cb(null, tempDir, {recursive:true});
            },
            filename: (req, file, cb) => {
               const uniqueSuffix = Date.now() + '-' + Math.round(Math.random())
               cb(null, 'temp' + uniqueSuffix, path.extname(file.originalname));
            }
        });   
    };

    getMiddleware() {
        return multer({ 
            storage: this.storage,
            limits: {
                fileSize: 50 * 1024 * 1024
            }
        });
    };
};

const service = new FollowUploadService();
// Wir exportieren eine fertige Instanz der Middleware
export const upload = service.getMiddleware();