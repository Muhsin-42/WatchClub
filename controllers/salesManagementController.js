const { monthlyReport, getReport, dailyReport, weeklyReport, yearlyReport, categoryWiseSales } = require('../helpers/salesManagingHelper')






const viewSalesManagement = async (req, res) => {
    const data = await monthlyReport()
    const daily = await dailyReport()
    const weekly = await weeklyReport()
    const yearly = await yearlyReport()
    const categWise = await categoryWiseSales()
    res.render('admin/salesReport', {data, daily, weekly, yearly, categWise})
}


module.exports = {
    viewSalesManagement
}