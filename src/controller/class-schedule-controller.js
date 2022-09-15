const Stundent = require('../model/Student');
const Teacher = require('../model/Teacher');
const Subject = require('../model/Subject');
const ClassSchedule = require('../model/ClassSchedule');
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');

const createClassSchedule = async(req,res) => {

    const {student : studentId , teacher : teacherId , subject : subjectId} = req.body;

    const student = await Stundent.findOne({_id : studentId});

    if(!student) {
        throw new CustomError.NotFoundError(`No stundent  with id ${studentId}`);
    }

    const teacher = await Teacher.findOne({_id : teacherId});

    if(!teacher) {
        throw new CustomError.NotFoundError(`No teacher with id ${teacherId}`);
    }

    const subject = await Subject.findOne({_id : subjectId});

    if(!subject) {
        throw new CustomError.NotFoundError(`No subject with id ${subjectId}`)
    }

    const classSchedule = await ClassSchedule.create(req.body);

    res.status(StatusCodes.CREATED).json(classSchedule);

};

const updateClassSchedule = async(req,res) => {
    const {id : classScheduleId} = req.params;
    
    const {time } = req.body;

    if(!time) {
        throw new CustomError.BadRequestError('Please Provide new time schedule');
    }
    
    
    const classSchedule = await ClassSchedule.findOne({_id : teacherId});
    
    if(!classSchedule) {
        throw new CustomError.BadRequestError(`No class schedult with id ${classScheduleId}`);
    }

    classSchedule.time = time;
    
    await classSchedule.save();

    res.status(StatusCodes.OK).json({classSchedule});

}

const getAllClassSchedule = async(req,res) => {
    
    let queryObject = {};

    if(req.user.user_type != 'admin') {
        if(req.user.user_type == 'teacher') {
            queryObject.teacher = req.user.user_id;
        }

        if(req.user.user_type == 'student') {
            queryObject.student = req.user.user_id;
        }
    }

    const classSchedule = await ClassSchedule.find(queryObject)
        .populate({path : 'student' , select : 'firstName email' })
        .populate({path : 'teacher' , select : 'firstName email' })
        .populate({path : 'subject' , select : 'name code'});

    res.status(StatusCodes.OK).json(classSchedule);
}

const removeClassSchedule = async(req,res) => {

    const {id : classScheduleId} = req.params;

    const classSchedule = await ClassSchedule.findOne({_id : classScheduleId});
    
    if(!classSchedule) {
        throw new CustomError.BadRequestError(`No class schedult with id ${classScheduleId}`);
    }

    classSchedule.remove();

    res.status(StatusCodes.OK).send('Class Schedule Remove From the Records.');

}

const getSingleClassSchedule = async(req,res) => {
    const {id : classScheduleId} = req.params;
    const classSchedule = await ClassSchedule.findOne({_id : classScheduleId })
        .populate({path : 'student' , select : 'firstName email' })
        .populate({path : 'teacher' , select : 'firstName email' })
        .populate({path : 'subject' , select : 'name code'});

    if(req.user.user_type != 'admin') {
        if(req.user.user_type == 'teacher') {
            if(classSchedule.teacher._id.toString() !== req.user.user_id) {
                throw new CustomError.UnAuthorizedError('Permission Denied');
            }
        }

        if(req.user.user_type == 'student') {
            if(classSchedule.student._id.toString() !== req.user.user_id) {
                throw new CustomError.UnAuthorizedError('Permission Denied');
            }
        }
    }

    res.status(StatusCodes.OK).json(classSchedule);
}


module.exports = {
    createClassSchedule,
    updateClassSchedule,
    getAllClassSchedule,
    removeClassSchedule,
    getSingleClassSchedule
}