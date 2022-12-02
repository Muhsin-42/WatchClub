const moment = require('moment/moment')
const Category = require('../models/category');
const OrdersModel = require('../models/orders');

// monthly report

const salesHelpers = {
    monthlyReport : () => {
        console.log('9');
        return new Promise(async (resolve, reject) => {
            try {
                let start = new Date(new Date() - 1000 * 60 * 60 * 24 * 30)
                let end = new Date()
    
                let orderSuccess = await OrdersModel.find({ date: { $gte: start, $lte: end }, status: { $nin: ['cancelled'] } }).sort({ Date: -1, Time: -1 })
                var i;
                for (i = 0; i < orderSuccess.length; i++) {
                    orderSuccess[i].date = moment(orderSuccess[i].date).format('lll')
                }
                let orderTotal = await OrdersModel.find({ date: { $gte: start, $lte: end } })
                let orderSuccessLength = orderSuccess.length
                let orderTotalLength = orderTotal.length
                let orderFailLength = orderTotalLength - orderSuccessLength
                let total = 0
                let razorpay = 0
                let cod = 0
                let paypal = 0
                let wallet = 0

                for (let i = 0; i < orderSuccessLength; i++) {
                    total = total + parseInt(orderSuccess[i].product.price)
                    
                    if(orderSuccess[i].product.productOfferActive){
                        total = total - (parseInt(orderSuccess[i].product.price)/100)*parseInt(orderSuccess[i].product.productOffer.offerPercentage)
                    }
                    if (orderSuccess[i].paymentMode === 'cod') {
                        cod++
                    } else if (orderSuccess[i].paymentMode === 'paypal') {
                        paypal++
                    } else if (orderSuccess[i].paymentMode === 'razorpay') {
                        razorpay++
                    }
                    else {
                        wallet++
                    }
                }
                // let productCount = await OrdersModel.aggregate([
                //     {
                //         $match: {
                //             $and: [{    status: { $nin: ["cancelled"] } },
                //             { date: { $gte: start, $lte: end } }]
                //         },
                //     },
                //     {
                //         $project: { _id: 0, quantity: '$products.quantity'}
                //     },
                //     { $unwind: '$quantity'  },
                //     {
                //         $group: {   _id: null,total: { $sum: '$quantity' }  }
                //     }
                // ])

                let productCount = await OrdersModel.find({status: {$nin : ['cancelled'] } , date: { $gte : start} }   ).count()

                var data = {
                    start: moment(start).format('YYYY/MM/DD'),
                    end: moment(end).format('YYYY/MM/DD'),
                    totalOrders: orderTotalLength,
                    successOrders: orderSuccessLength,
                    failOrders: orderFailLength,
                    totalSales: total,
                    cod: cod,
                    paypal: paypal,
                    razorpay: razorpay,
                    wallet: wallet,
                    productCount: productCount,
    
                    currentOrders: orderSuccess
                }
                resolve(data)
            }
            catch {
                resolve(0)
            }
        })
    },
    
    // get report
    getReport : (startDate, endDate) => {
        return new Promise(async (resolve, reject) => {
            try {
                let start = new Date(startDate)
                let end = new Date(endDate)
    
                let orderSuccess = await OrdersModel.find({ date: { $gte: start, $lte: end }, status: { $nin: ['cancelled'] } }).sort({ Date: -1, Time: -1 })
                let orderTotal = await OrdersModel.find({ date: { $gte: start, $lte: end } })
                
                let orderSuccessLength = orderSuccess.length
                let orderTotalLength = orderTotal.length
                let orderFailLength = orderTotalLength - orderSuccessLength
                let total = 0
    
                let razorpay = 0
                let cod = 0
                let paypal = 0
                let wallet = 0
                let productCount = 0
                for (let i = 0; i < orderSuccessLength; i++) {
                    total = total + orderSuccess[i].amount
                    if (orderSuccess[i].paymentMode === 'cod') {
                        cod++
                    } else if (orderSuccess[i].paymentMode === 'paypal') {
                        paypal++
                    } else if (orderSuccess[i].paymentMode === 'razorpay') {
                        razorpay++
                    }
                    else {
                        wallet++
                    }
                }
                productCount = productCount = await OrdersModel.find({status: {$nin : ['cancelled'] } , date: { $gte : start} }   ).count()
                var data = {
                    start: moment(start).format('YYYY/MM/DD'),
                    end: moment(end).format('YYYY/MM/DD'),
                    totalOrders: orderTotalLength,
                    successOrders: orderSuccessLength,
                    failOrders: orderFailLength,
                    totalSales: total,
                    cod: cod,
                    paypal: paypal,
                    razorpay: razorpay,
                    wallet: wallet,
                    productCount: productCount,
                    currentOrders: orderSuccess
                }
                console.log('132 ');
                resolve(data)
            } catch {
                resolve(0)
            }
        })
    },
    dailyReport : () => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('142');
                let start = new Date(new Date() - 1000 * 60 * 60 * 24)
                let end = new Date()
    
                let orderSuccess = await OrdersModel.find({ date: { $gte: start, $lte: end }, status: { $nin: ['cancelled'] } }).sort({ Date: -1, Time: -1 })
                let orderTotal = await OrdersModel.find({ date: { $gte: start, $lte: end } })


                let orderSuccessLength = orderSuccess.length
                let orderTotalLength = orderTotal.length
                let orderFailLength = orderTotalLength - orderSuccessLength
                let total = 0
                let razorpay = 0
                let cod = 0
                let paypal = 0
                let wallet = 0
                let productCount = 0
                // console.log('159 = ',orderSuccess);
                let uniqueCartId = ''
                for (let i = 0; i < orderSuccessLength; i++) {
                    total = total + parseInt(orderSuccess[i].product.price)
                    
                    if(orderSuccess[i].product.productOfferActive){
                        total = total - (parseInt(orderSuccess[i].product.price)/100)*parseInt(orderSuccess[i].product.productOffer.offerPercentage)
                    }
                    if (orderSuccess[i].paymentMethod === 'cod') {
                        cod++
                    } else if (orderSuccess[i].paymentMethod === 'paypal') {
                        paypal++
                    } else if (orderSuccess[i].paymentMethod === 'razorpay') {
                        razorpay++
                    }
                    else {
                        wallet++
                    }
                }

                 productCount = await OrdersModel.find({status: {$nin : ['cancelled'] } , date: { $gte : start} }   ).count()


                var data = {
                    start: moment(start).format('YYYY/MM/DD'),
                    end: moment(end).format('YYYY/MM/DD'),
                    totalOrders: orderTotalLength,
                    successOrders: orderSuccessLength,
                    failOrders: orderFailLength,
                    totalSales: total,
                    cod: cod,
                    paypal: paypal,
                    razorpay: razorpay,
                    wallet: wallet,
                    productCount: productCount,
                    averageRevenue: total / productCount,
                    currentOrders: orderSuccess
                }
                // console.log('191 ',data);
                resolve(data)
            } catch {
                resolve(0)
            }
        })
    },
    
    // weekly report
    weeklyReport : () => {
        return new Promise(async (resolve, reject) => {
            try {
    
                let start = new Date(new Date() - 1000 * 60 * 60 * 24 * 7)
    
                let end = new Date()
    
                let orderSuccess = await OrdersModel.find({ date: { $gte: start, $lte: end }, status: { $nin: ['cancelled'] } }).sort({ Date: -1, Time: -1 })
                let orderTotal = await OrdersModel.find({ date: { $gte: start, $lte: end } })
                let orderSuccessLength = orderSuccess.length
                let orderTotalLength = orderTotal.length
                let orderFailLength = orderTotalLength - orderSuccessLength
                let total = 0
                let razorpay = 0
                let cod = 0
                let paypal = 0
                let wallet = 0
                let productCount = 0
                for (let i = 0; i < orderSuccessLength; i++) {
                    total = total + parseInt(orderSuccess[i].product.price)
                    
                    if(orderSuccess[i].product.productOfferActive){
                        total = total - (parseInt(orderSuccess[i].product.price)/100)*parseInt(orderSuccess[i].product.productOffer.offerPercentage)
                    }
                    if (orderSuccess[i].paymentMethod === 'cod') {
                        cod++
                    } else if (orderSuccess[i].paymentMethod === 'paypal') {
                        paypal++
                    } else if (orderSuccess[i].paymentMethod === 'razorpay') {
                        razorpay++
                    }
                    else {
                        wallet++
                    }
                }
    
                productCount = productCount = await OrdersModel.find({status: {$nin : ['cancelled'] } , date: { $gte : start} }   ).count()

    
                var data = {
                    start: moment(start).format('YYYY/MM/DD'),
                    end: moment(end).format('YYYY/MM/DD'),
                    totalOrders: orderTotalLength,
                    successOrders: orderSuccessLength,
                    failOrders: orderFailLength,
                    totalSales: total,
                    cod: cod,
                    paypal: paypal,
                    razorpay: razorpay,
                    wallet: wallet,
                    productCount: productCount,
                    averageRevenue: total / productCount,
    
                    currentOrders: orderSuccess
                }
                // console.log('252 = ',data);
                resolve(data)
            } catch {
                resolve(0)
            }
        })
    },
    
    // yearly report
    yearlyReport : () => {
        return new Promise(async (resolve, reject) => {
            try {
    
                let start = new Date(new Date() - 1000 * 60 * 60 * 24 * 365)
    
                let end = new Date()
    
                let orderSuccess = await OrdersModel.find({ date: { $gte: start, $lte: end }, status: { $nin: ['cancelled'] } }).sort({ Date: -1, Time: -1 })
                let orderTotal = await OrdersModel.find({ date: { $gte: start, $lte: end } })
                let orderSuccessLength = orderSuccess.length
                let orderTotalLength = orderTotal.length
                let orderFailLength = orderTotalLength - orderSuccessLength
                let total = 0
                let razorpay = 0
                let cod = 0
                let paypal = 0
                let wallet = 0
                let productCount = 0
                for (let i = 0; i < orderSuccessLength; i++) {
                    total = total + parseInt(orderSuccess[i].product.price)
                    
                    if(orderSuccess[i].product.productOfferActive){
                        total = total - (parseInt(orderSuccess[i].product.price)/100)*parseInt(orderSuccess[i].product.productOffer.offerPercentage)
                    }
                    if (orderSuccess[i].paymentMethod === 'cod') {
                        cod++
                    } else if (orderSuccess[i].paymentMethod === 'paypal') {
                        paypal++
                    } else if (orderSuccess[i].paymentMethod === 'razorpay') {
                        razorpay++
                    }
                    else {
                        wallet++
                    }
                }
    
                productCount = await OrdersModel.find({status: {$nin : ['cancelled'] } , date: { $gte : start} }   ).count()

    
                var data = {
                    start: moment(start).format('YYYY/MM/DD'),
                    end: moment(end).format('YYYY/MM/DD'),
                    totalOrders: orderTotalLength,
                    successOrders: orderSuccessLength,
                    failOrders: orderFailLength,
                    totalSales: total,
                    cod: cod,
                    paypal: paypal,
                    razorpay: razorpay,
                    wallet: wallet,
                    productCount: productCount,
                    averageRevenue: total / productCount,
                    currentOrders: orderSuccess
                }
                // console.log('312', data);
                resolve(data)
            } catch {
                resolve(0)
            }
        })
    },
    categoryWiseSales : () => {
        return new Promise(async(resolve, reject) => {
            try {
                const data = await OrdersModel.aggregate([
                    {
                        $match: {
                            status:{$nin:['cancelled']}
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            product: '$product',
                            quantity: '$quantity'
    
                        }
                    },
                    {
                        $unwind: '$product'
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: 'product',
                            foreignField: '_id',
                            as: 'prod'
                        }
                    },
                    {
                        $unwind: '$prod'
                    },
                    {
                        $project: {
                            _id: 0,
                            quantity: 1,
                            category: '$prod.category',
                            price: { $multiply: ['$quantity', '$prod.price'] }
    
                        }
                    },
                    {
                        $group: {
                            _id: '$category',
                            count: { $sum: '$quantity' },
                            total: { $sum: '$price' }
    
                        }
                    }
                ])
                resolve(data)
                
            }catch{
                resolve(0)
            }
        })
    }

}


module.exports = salesHelpers;