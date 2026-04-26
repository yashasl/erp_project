const express = require('express');
const router = express.Router({ mergeParams: true });
const { createTask, getTasks, getTask, updateTask, deleteTask, addComment, getMyTasks } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/my', getMyTasks);

router.route('/')
  .get(getTasks)
  .post(authorize('Admin', 'Manager'), createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(authorize('Admin', 'Manager'), deleteTask);

router.post('/:id/comments', addComment);

module.exports = router;
