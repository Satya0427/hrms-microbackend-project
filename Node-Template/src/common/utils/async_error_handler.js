

const async_error_handler = (func) => {
    return (req, res, next) => {
        func(req, res, next)
            .catch((error) => {
                next(error)
            })
    }
}

module.exports = { async_error_handler }