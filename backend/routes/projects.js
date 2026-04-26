const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProject, updateProject, deleteProject, addMember, removeMember } = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(authorize('Admin', 'Manager'), createProject);

router.route('/:id')
  .get(getProject)
  .put(authorize('Admin', 'Manager'), updateProject)
  .delete(authorize('Admin'), deleteProject);

router.post('/:id/members', authorize('Admin', 'Manager'), addMember);
router.delete('/:id/members/:userId', authorize('Admin', 'Manager'), removeMember);

module.exports = router;
