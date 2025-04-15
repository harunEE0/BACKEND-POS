/**E:\learn-code\backend-pos\utills\apiFeatures.js */
class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // ฟังก์ชันสำหรับการจัดการการกรองข้อมูล
  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = ['sort', 'page', 'limit'];
    excludeFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
    
    this.query.find(JSON.parse(queryStr));
    return this;
  }

  // ฟังก์ชันสำหรับการจัดเรียงข้อมูล
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // ฟังก์ชันสำหรับการทำ Pagination
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = ApiFeatures;
