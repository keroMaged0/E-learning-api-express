import { NotFoundError } from "../../errors/notFoundError";
import { Certificate } from "../../models/certificate.models";

/*************** Find a certificate by query. ***************/
const findCertificate = async (query: any, next: Function) => {
    const certificate = await Certificate.findOne(query);
    if (!certificate) {
        return next(new NotFoundError('certificate not found'));
    }
    return certificate;
};

/*************** Find a certificate by ID. ***************/
const findCertificateById = async (certificateId: string, next: Function) => {
    const certificate = await Certificate.findById(certificateId);
    if (!certificate) {
        return next(new NotFoundError('certificate not found'));
    }
    return certificate;
};

export {
    findCertificate,
    findCertificateById,
}