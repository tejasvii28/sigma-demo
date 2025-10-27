// function wrapAsync(fn){
//     return function(req,res,next){
//         fn(req,res,next).catch(next);
//     }
// }


// wrapAsync can be written like this
module.exports = (fn) =>{
    return (req,res,next) =>{
        fn(req,res,next).catch(next);
    }
}