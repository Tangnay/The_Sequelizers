const router = require('express').Router();
const multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, 'uploads/');
    },
    filename: function (req, file, callback) {
      callback(null, file.originalname);
    },
    onFileUploadStart: function(file, req, res){
        console.log('made it here!')
      if(req.files.file.length > 1000000000) {
        return false;
      }
    }
  });

const upload = multer({storage, limits:{fileSize:1000000000, fieldNameSize:10000000000}});
//const upload = multer();

const {
    User,
    Post,
    Comment
} = require('../../models');
const withAuth = require('../../utils/auth');

router.get("/", (req, res) => {
    Post.findAll({
            attributes: ["id", "content", "title", "image", "created_at"],
            order: [
                ["created_at", "DESC"]
            ],
            include: [{
                    model: User,
                    attributes: ["username"],
                },
                {
                    model: Comment,
                    attributes: ["id", "comment_text", "post_id", "user_id", "created_at"],
                    include: {
                        model: User,
                        attributes: ["username"],
                    },
                },
            ],
        })
        .then((dbPostData) => res.json(dbPostData))
        .catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.get("/:id", (req, res) => {
    Post.findOne({
            where: {
                id: req.params.id,
            },
            attributes: ["id", "content", "title", "image", "created_at"],
            include: [{
                    model: User,
                    attributes: ["username"],
                },
                {
                    model: Comment,
                    attributes: ["id", "comment_text", "post_id", "user_id", "created_at"],
                    include: {
                        model: User,
                        attributes: ["username"],
                    },
                },
            ],
        })
        .then((dbPostData) => {
            if (!dbPostData) {
                res.status(404).json({
                    message: "No post found with this id"
                });
                return;
            }
            res.json(dbPostData);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
});

// router.post("/", withAuth, (req, res) => {
//     console.log("creating");
//     Post.create({
//             title: req.body.title,
//             content: req.body.post_content,
//             user_id: req.session.user_id,
//             image: req.file,
//         })
//         .then((dbPostData) => res.json(dbPostData))
//         .catch((err) => {
//             console.log(err);
//             res.status(500).json(err);
//         });
// });

router.post('/upload', withAuth, upload.single('avatar'), async (req, res) => {
    console.log(req.body)
    console.log(req.file)

    await Post.create({
        title: req.body.post_title,
        content: req.body.post_content,
        user_id: req.session.user_id,
        image: req.file,
    })
    .then((dbPostData) => res.json(dbPostData))
    .catch((err) => {
        console.log(err);
        res.status(500).json(err);
    });

    if (!req.file) {
      console.log("No file received");
      return res.send({
        success: false
      });
  
    // } else {
    //   console.log('file received');
    //   return res.send({
    //     success: true
    //   })
    // }
    }    
});

router.put("/:id", withAuth, (req, res) => {
    Post.update({
            title: req.body.title,
            content: req.body.post_content,
            image: req.file
        }, {
            where: {
                id: req.params.id,
            },
        })
        .then((dbPostData) => {
            if (!dbPostData) {
                res.status(404).json({
                    message: "No post found with this id"
                });
                return;
            }
            res.json(dbPostData);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.delete("/:id", withAuth, (req, res) => {
    Post.destroy({
            where: {
                id: req.params.id,
            },
        })
        .then((dbPostData) => {
            if (!dbPostData) {
                res.status(404).json({
                    message: "No post found with this id"
                });
                return;
            }
            res.json(dbPostData);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
});


module.exports = router;