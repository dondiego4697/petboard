import * as express from 'express';
import * as fileUpload from 'express-fileupload';
import {updateAvatar} from 'server/v1/routers/private/s3-storage/providers/update-avatar';
import {uploadAdImage} from 'server/v1/routers/private/s3-storage/providers/upload-ad-image';

export const router = express
    .Router()
    .use(
        fileUpload({
            uploadTimeout: 30 * 1000,
            limits: {
                fileSize: 2 * 1024 * 1024
            }
        })
    )
    .post('/update_avatar', updateAvatar)
    .post('/upload_ad_image', uploadAdImage);
