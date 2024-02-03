const express = require('express');
const Project = require('../models/Project');
const {body, validationResult} = require('express-validator');
const fetchuser = require('../middleware/fetchuser');

const projectRouter = express.Router()

projectRouter.get(
	"/",
	fetchuser,
	async (req, res) => {
		try {
			const allProjects = await Project.find({
				owner: req.user.id,
				trashStatus: false
			})

			return res.status(200).json({
				projects: allProjects
			})
		} catch (err) {
			return res.status(500).json({error: err.message})
		}
	}
)

projectRouter.get(
	"/trash",
	fetchuser,
	async (req, res) => {
		try {
			const allProjects = await Project.find({
				owner: req.user.id,
				trashStatus: true
			})

			return res.status(200).json({
				projects: allProjects
			})
		} catch (err) {
			return res.status(500).json({error: err.message})
		}
	}
)

// create project /api/projects
projectRouter.post(
	"/",
	fetchuser,
	[
		body("name", "Title cannot be empty").isString()
	],
	async (req, res) => {
		const valRes = validationResult(req)
		if (!valRes.isEmpty()) {
			return res.status(400).json({
				errors: valRes.array()
			})
		}

		const userId = req.user.id

		const projectDoc = new Project({
			owner: userId,
			name: req.body.name
		})

		await projectDoc.save()

		res.status(200).json({
			project: projectDoc
		})
	}
)

projectRouter.get(
	"/:projectId",
	fetchuser,
	async (req, res) => {
		try {
			const {projectId} = req.params
			if (projectId === undefined) {
				return res.status(404).json({
					error: "Not Found"
				})
			}
			const projectDoc = await Project.findOne({
				_id: {
					"$eq": projectId
				},
				owner: {
					"$eq": req.user.id
				},
				trashStatus: {
					"$eq": false
				}
			})
			if (projectDoc === null) {
				return res.status(404).json({
					error: "Not Found"
				})
			}
			return res.status(200).json({
				project: projectDoc
			})
		} catch (err) {
			return res.status(500).json({error: err.message})
		}
	}
)

projectRouter.put(
	"/:projectId",
	fetchuser,
	async (req, res) => {
		try {
			const {projectId} = req.params
			if (projectId === undefined) {
				return res.status(404).json({
					error: "Not Found"
				})
			}
			await Project.updateOne({
				_id: {
					"$eq": projectId
				},
				owner: {
					"$eq": req.user.id
				},
				trashStatus: {
					"$eq": false
				}
			}, {
				...req.body,
				trashStatus: false,
				owner: req.user.id
			})

			const projectDoc = await Project.findOne({
				_id: {
					"$eq": projectId
				},
				owner: {
					"$eq": req.user.id
				},
				trashStatus: {
					"$eq": false
				}
			})

			if (projectDoc === null) {
				return res.status(404).json({
					error: "Not Found"
				})
			}

			return res.status(200).json({
				project: projectDoc
			})
		} catch (err) {
			return res.status(500).json({error: err.message})
		}
	}
)

projectRouter.delete(
	"/:projectId",
	fetchuser,
	async (req, res) => {
		try {
			const {projectId} = req.params
			if (projectId === undefined) {
				return res.status(404).json({
					error: "Not Found"
				})
			}
			const projectDoc = await Project.findOne({
				_id: {
					"$eq": projectId
				},
				owner: {
					"$eq": req.user.id
				},
				trashStatus: {
					"$eq": false
				}
			})

			if (projectDoc === null) {
				return res.status(404).json({
					error: "Not Found"
				})
			}

			projectDoc.trashStatus = true;

			await projectDoc.save()

			return res.status(200).json({
				project: projectDoc
			})
		} catch (err) {
			return res.status(500).json({error: err.message})
		}
	}
)

projectRouter.post(
	"/:projectId/restore",
	fetchuser,
	async (req, res) => {
		try {
			const {projectId} = req.params
			if (projectId === undefined) {
				return res.status(404).json({
					error: "Not Found"
				})
			}
			const projectDoc = await Project.findOne({
				_id: {
					"$eq": projectId
				},
				owner: {
					"$eq": req.user.id
				},
				trashStatus: {
					"$eq": true
				}
			})

			if (projectDoc === null) {
				return res.status(404).json({
					error: "Not Found"
				})
			}

			projectDoc.trashStatus = false;

			await projectDoc.save()

			return res.status(200).json({
				project: projectDoc
			})
		} catch (err) {
			return res.status(500).json({error: err.message})
		}
	}
)

module.exports = projectRouter