exports.catchErrors = (fn) => {
    return function (req, res, next) {
        const resp = fn(req, res, next);
        if (resp instanceof Promise) {
            return resp.catch(next);
        }
        return resp;
    };
};

exports.notFound = (req, res, next) => {
    res.status(404).json({
        success: false, message: "API endpoint not found",
    });
};

exports.errors = (err, req, res, next) => {
    err.stack = err.stack || "";

    res.status(500).json({
        success: false, message: "Oops! Server Error", error: {
            message: err.message, stack: err.stack,
        },
    });
};

