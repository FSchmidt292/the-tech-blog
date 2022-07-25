const router = require('express').Router();
const sequelize = require('../../config/connection');
const { User, Post, Comment } = require('../../models');
const withAuth = require('../../utils/auth');

router.get('/', (req, res) => {
    User.findAll({
        attributes: { exclude: ['password'] }
    })
    .then(dbUserData => res.json(dbUserData))
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

router.get('/:id', (req, res) => {
    User.findOne({
    attributes: { exclude: ['password'] },
    where: {
      id: req.params.id
    },
  include: [
      {
        model: Post,
        attributes: ['id', 'title', 'text_content', 'created_at']
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
        res.status(404).json({ message: 'No user with this ID found' });
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
    email: req.body.email,
    password: req.body.password
  })
  .then(dbUserData => {
    req.session.save(() => {
      req.session.user_id = dbUserData.id;
      req.session.username = dbUserData.username;
      req.session.loggedIn = true;

      res.json(dbUserData);
    });
  });
});

router.post('/login', (req, res) => {
  User.findOne({
    where: {
      email: req.body.email
    }
  }).then(dbUserData => {
    if (!dbUserData) {
      res.status(400).json({ message: 'No user with that email address' });
    return; 
      }

      const validPassword = dbUserData.checkPassword(req.body.password);

    if (!validPassword) {
      res.status(400).json({ message: 'Error, wrong password' });
      return;
    }

    req.session.save(() => {
        req.session.user_id = dbUserData.id;
        req.session.username = dbUserData.username;
        req.session.loggedIn = true;
      res.json({ user: dbUserData, message: 'You are now logged in' });
    });
  });
});

router.post('/logout', withAuth, (req,res) => {
  if (req.session.loggedIn) {
      req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

module.exports = router;
