const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

exports.getDashboard = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'Admin';

    const [totalProjects, totalUsers, tasks, projects] = await Promise.all([
      isAdmin ? Project.countDocuments() : Project.countDocuments({ members: req.user._id }),
      isAdmin ? User.countDocuments() : null,
      isAdmin ? Task.find() : Task.find({ assignedTo: req.user._id }),
      isAdmin
        ? Project.find().select('name status').limit(5).sort('-createdAt')
        : Project.find({ members: req.user._id }).select('name status').limit(5).sort('-createdAt'),
    ]);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const todoTasks = tasks.filter(t => t.status === 'Todo').length;

    const byPriority = {
      High:   tasks.filter(t => t.priority === 'High').length,
      Medium: tasks.filter(t => t.priority === 'Medium').length,
      Low:    tasks.filter(t => t.priority === 'Low').length,
    };

    res.json({
      totalProjects,
      ...(isAdmin && { totalUsers }),
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      byPriority,
      recentProjects: projects,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
