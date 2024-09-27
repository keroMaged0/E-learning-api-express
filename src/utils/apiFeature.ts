
export class ApiFeature {
    query: any;
    queryString: any;

    constructor(query: any, queryString: any) {
        this.query = query;
        this.queryString = queryString;
    }

    // pagination
    paginate() {
        console.log(this.queryString);

        const page = parseInt(this.queryString.page, 10) || 1;
        const limit = parseInt(this.queryString.limit, 10) || 2;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit)
        return this;
    }

    // filtering
    filter() {
        const queryObj = { ...this.queryString }
        const excloudeFildes = ['page', 'sort', 'limit', 'fields'];
        excloudeFildes.forEach(el => delete queryObj[el])

        this.query = this.query.find(queryObj)
        return this;
    }

    // sorting
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }


    // search 
    search() {
        if (this.queryString.keyword) {
            const searchField = this.queryString.searchField || 'title';

            let keyword: any = this.queryString.keyword;

            // التحقق إذا كانت القيمة هي عدد صحيح أو نص
            if (!isNaN(keyword)) {
                // إذا كانت القيمة عددية، استخدمها مباشرة في الاستعلام
                keyword = parseFloat(keyword);

            } else {
                // إذا كانت القيمة نصية، استخدم regex للبحث النصي
                keyword = {
                    $regex: this.queryString.keyword,
                    $options: 'i',  // يجعل البحث غير حساس لحالة الأحرف
                };
            }

            // تنفيذ البحث باستخدام الكلمة المفتاحية
            this.query = this.query.find({ [searchField]: keyword });

        }

        return this;
    }


}




