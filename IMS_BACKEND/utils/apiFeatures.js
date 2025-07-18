class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    // Search by name
search() {
    const keyword = this.queryStr.keyword
        ? {
              $or: [
                  { fullName: { $regex: this.queryStr.keyword, $options: 'i' } },
                  { emailAddress: { $regex: this.queryStr.keyword, $options: 'i' } },
                  { contactNumber: { $regex: this.queryStr.keyword, $options: 'i' } },
                  { generatedRegNo: { $regex: this.queryStr.keyword, $options: 'i' } },
                  { formNo: { $regex: this.queryStr.keyword, $options: 'i' } },
                  { courseApplied: { $regex: this.queryStr.keyword, $options: 'i' } },
                  { generatedRegNo: { $regex: this.queryStr.keyword, $options: 'i' } },
                  { category: { $regex: this.queryStr.keyword, $options: 'i' } },
                  { preferredModeOfLearning: { $regex: this.queryStr.keyword, $options: 'i' } },
              ],
          }
        : {};

    this.query = this.query.find({ ...keyword });
    return this;
}

    // Filter by fields (e.g., price[gte]=1000)
    filter() {
        const queryCopy = { ...this.queryStr };

        // Remove fields that are not filter parameters
        const removeFields = ['keyword', 'page', 'limit'];
        removeFields.forEach((key) => delete queryCopy[key]);

        // Advanced filtering: convert gte/lte to MongoDB format
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    // Pagination using limit and page
    paginate(resultPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resultPerPage * (currentPage - 1);

        this.query = this.query.limit(resultPerPage).skip(skip);
        return this;
    }
}

module.exports = ApiFeatures;
