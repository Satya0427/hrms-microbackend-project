

const apiResponse = (sts, msg) => {
    return {
        sts,
        msg
    }
}

const apiDataResponse = (sts, msg, data) => {
    return {
        sts,
        msg,
        data
    }
}


module.exports = { apiResponse, apiDataResponse }