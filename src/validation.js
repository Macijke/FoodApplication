const {body, validationResult} = require('express-validator');

const registerFormValidationRules = () => {
    return [
        body('firstName').isLength({min: 2}).trim().withMessage('Imię musi zawierać przynajmniej 2 znaki.'),
        body('lastName').isLength({min: 2}).trim().withMessage('Nazwisko musi zawierać przynajmniej 2 znaki.'),
        body('email').isEmail().trim().withMessage('Proszę podać prawidłowy adres e-mail.'),
        body('password').isLength({min: 8}).withMessage('Hasło musi zawierać co najmniej 8 znaków.'),
        body('rPassword').custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Hasła się nie zgadzają.');
            }
            return true;
        }),
        body('adressCity').notEmpty().trim().withMessage('Proszę podać miejscowość.'),
        body('adressStreet').notEmpty().trim().withMessage('Proszę podać ulicę.'),
        body('adressNumber').notEmpty().trim().withMessage('Proszę podać numer budynku.'),
        body('adressLocal').optional()
    ];
};

const validateRegister = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const {firstName, lastName, email, adressCity, adressStreet, adressNumber, adressLocal} = req.body;
        let extractedErrors = {};
        errors.array().map(error => extractedErrors[error.path] = error.msg);
        console.log(extractedErrors);
        return res.render('register', {
            errors: extractedErrors,
            values: {firstName, lastName, email, adressCity, adressStreet, adressNumber, adressLocal},
        });

    }
    next();
};

module.exports = {validateRegister, registerFormValidationRules}