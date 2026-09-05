const Joi = require("joi");

module.exports.menuSchema = Joi.object({
    menu: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        description: Joi.string().required(),
        image: Joi.string().allow("",null),
        category: Joi.string().valid("veg", "non-veg").required(),
        image:Joi.any(),
        location: Joi.string().required()  
    }).required()

});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
})