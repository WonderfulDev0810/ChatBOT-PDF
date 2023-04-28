import multer from 'multer';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

const upload = multer({
    dest: 'uploads/' // set the directory where uploaded files will be stored
});

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    upload.single('file')(req, res, function(err) {
        console.log(err);
        if (err) {
            return res.status(500).send(err);
        }
        console.log(req.file); // do something with uploaded file
        res.send('File uploaded successfully!');
        });
}