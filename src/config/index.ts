import fileUpload from 'express-fileupload';

export const fileConfig = fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: {fileSize: 5*1024*1024},
    safeFileNames: true,
    abortOnLimit: true,
    responseOnLimit: 'File size limit has been reached (5MB)',
    preserveExtension: true,
})
