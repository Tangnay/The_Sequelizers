const router = require('express').Router();
const {
    User,
    Post,
    Comment
} = require('../../models');
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
    User.findAll({
            attributes: {
                exclude: ['password']
            }
        })
        .then(dbUserData => res.json(dbUserData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.get('/:id', (req, res) => {
    User.findOne({
            attributes: {
                exclude: ['password']
            },
            where: {
                id: req.params.id
            },
            include: [{
                    model: Post,
                    attributes: ['id', 'title', 'content', 'created_at']
                },
                {
                    model: Comment,
                    attributes: ['id', 'comment_text', 'created_at'],
                    include: {
                        model: Post,
                        attributes: ['title']
                    }
                }
            ]
        })
        .then(dbUserData => {
            if (!dbUserData) {
                res.status(404).json({
                    message: 'No user found with this id'
                });
                return;
            }
            res.json(dbUserData);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.post('/', (req, res) => {
    User.create({
            username: req.body.username,
            password: req.body.password
        })
        .then(dbUserData => {
            req.session.save(() => {
                req.session.user_id = dbUserData.id;
                req.session.username = dbUserData.username;
                req.session.loggedIn = true;

                res.json(dbUserData);
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
})

// router.post('/login', async (req, res) => {
//    const dbUserData = await User.findOne({
//             where: {
//                 username: req.body.username
                
//             }
//         })
//          try{
//             if (!dbUserData) {
//                 res.status(400).json({
//                     message: 'No user with that username!'
//                 });
//                 return;
//             }

//             req.session.save(() => {
//                 req.session.user_id = dbUserData.id;
//                 req.session.username = dbUserData.username;
//                 req.session.loggedIn = true;

//                 res.json({
//                     user: dbUserData,
//                     message: 'You are now logged in!'
//                 });
//             });

//             const validPassword = dbUserData.checkPassword(req.body.password);

//             if (!validPassword) {
//                 res.status(400).json({
//                     message: 'Incorrect password!'
//                 });
//                 return;
//             }

//             req.session.save(() => {
//                 req.session.user_id = dbUserData.id;
//                 req.session.username = dbUserData.username;
//                 req.session.loggedIn = true;

//                 res.json({
//                     user: dbUserData,
//                     message: 'You are now logged in!'
//                 });
//             });
//         }catch(err){res.status(500).json(err)}});
router.post('/login', async (req, res) => {
    try {
      // we search the DB for a user with the provided email
      const userData = await User.findOne({ where: { username: req.body.username } });
     console.log(userData)
      if (!userData) {
        // the error message shouldn't specify if the login failed because of wrong email or password
        res.status(404).json({ message: 'Login failed. Please try again!' });
        return;
      }
      // use `bcrypt.compare()` to compare the provided password and the hashed password
      const validPassword = await bcrypt.compare(
        req.body.password,
        userData.password
      );
      // if they do not match, return error message
      if (!validPassword) {
        res.status(400).json({ message: 'Login failed. Please try again!' });
        return;
      }
      req.session.save(() =>{
        req.session.user_id = userData.id;
        req.session.username = userData.username;
        req.session.loggedIn = true

      });


      // if they do match, return success message
      res.status(200).json({ message: 'You are now logged in!' });
    } catch (err) {
      res.status(500).json(err);
    }
  });  
  

router.post('/logout', (req, res) => {
    if (req.session.loggedIn) {
        req.session.destroy(() => {
            res.status(204).end();
        });
    } else {
        res.status(404).end();
    }

});

module.exports = router;