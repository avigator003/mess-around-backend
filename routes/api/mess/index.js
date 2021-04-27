const router = require('express').Router()
const controller = require('./mess.controller')

router.get('/list', controller.list)
router.post('/assign-admin/:username', controller.assignAdmin)
router.post('/resetpassword', controller.resetpassword)
router.post('/setpassword', controller.setpassword)
router.post('/verify', controller.verify)
router.get('/delete/:id', controller.deleteMess)
router.get('/count', controller.count)
router.post('/update/:id', controller.updateMess)
router.get('/view/:id', controller.viewMess)





module.exports = router