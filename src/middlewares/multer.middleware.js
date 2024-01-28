const multer=require("multer")
const crypt=require("crypt")



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public')
    },
    filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    let fileName=file.originalname + Date.now()
      cb(null, fileName)  // we are getting filename as response
      console.log("filaname===>",fileName)
    } 
    
  })

// let storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//       cb(null, 'public/')
//   },
//   filename: function (req, file, cb) {
//     console.log("===>",file)
//       let splitFileName = file.originalname.split('.');
//       let hashFileName = crypt.hashIt((  crypt.random(parseInt(process.env.SALT_LENGTH), process.env.RANDOM_STRING_KEY))+Date.now() + splitFileName[0]);
//       let _filename_ = hashFileName.concat('.'+splitFileName[splitFileName.length - 1]);
//       cb(null, _filename_);
//       console.log("filename==>",_filename_)
//       // crypt.random
//   }
// })
  
  // console.log("storage==>",storage)
//   const upload = multer({ storage: storage })
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5, // Limit the file size to 5MB (adjust as needed)
    },
  });

  module.exports={upload}