// report CUD by user ( After taken action by admin, report cant be updated or deleted by user)
// report read, update by ADMIN
import prisma from "../model/db.js";

export const createReport = async (req, res) => {
    try {
        // only authenticated USER or MENTOR can create report
        const authUser = req.user;
        if (!(authUser.role === 'USER' || authUser.role === 'MENTOR')) {
            return res.status(403).json({ message: 'Only users and mentors are allowed to report' });
        }

        // ensure the report is created for the authenticated user
        const reportData = req.body.report || {};
        if (authUser.id) reportData.userId = BigInt(authUser.id);

        const report = await prisma.report.create({ data: reportData });
        return res.status(201).json({ message: 'Report created successfully', data: report });
    }
    catch (error) {
        return res.status(500).json({ message: "Unable to create report, try again later ", error: error })
    }
}

export const updateReport = async (req, res) => {
    try {
        // update can only be possible based on report status
        // admin cannot update report
        const authUser = req.user;

        const report = await prisma.report.findFirst({ where: { id: BigInt(req.params.id) } });
        if (!report) return res.status(404).json({ message: 'Report not found' });

        if (report.status !== 'PENDING') return res.status(403).json({ message: 'Report cannot be updated in its current status' });

        const isOwner = String(report.userId) === String(authUser.id);
        if (!(isOwner && (authUser.role === 'USER' || authUser.role === 'MENTOR'))) {
            return res.status(403).json({ message: 'Only the report owner can update a pending report' });
        }

        const updatedReport = await prisma.report.update({
            where: { id: BigInt(req.params.id) },
            data: req.body.report || {}
        });
        return res.status(200).json({ message: 'Report updated', data: updatedReport });
    }
    catch (error) {
        return res.status(500).json({ message: 'Unable to update report', error: error.message });
    }
}

export const deleteReport = async (req, res) => {
    try {
        // delete can only be possible if report status is pending for user (not admin)
        // admin can not delete report
        const report = await prisma.report.findFirst({
            where: {id:BigInt(req.params.id)}
        })
        if(!report) return res.status(404).json({message:"Report does not exist"})
        const authUser = req.user;

        if (report.status === 'PENDING'){
            const isOwner = String(report.userId) === String(authUser.id);
            if (!isOwner || !(authUser.role === 'USER' || authUser.role === 'MENTOR')) {
                return res.status(403).json({ message: 'Only the report owner can delete a pending report' });
            }
            const deletedReport = await prisma.report.delete({where: {id:BigInt(req.params.id)}})
            return res.status(200).json({message:"Report deleted successfully ",data:deletedReport})
        }
       return res.status(403).json({message: "Unable to delete the report in its current status", data:report})
    }
    catch (error) {
          return res.status(500).json({message:"Please try again later",error:error.message})
    }
}

export const readAllReport = async (req, res) => {
    // apply all required filters, only admin can get the reports
    try {
        const authUser = req.user;
        if (authUser.role !== 'ADMIN') return res.status(403).json({ message: 'Admin access required' });

        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit, 10) || 6, 1);
        const status = (req.query.status || 'PENDING').toString().trim().toUpperCase();
        const order = (req.query.order || 'desc').toString().trim().toLowerCase() === 'asc' ? 'asc' : 'desc';
        const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

        const where = {};
        if (status !== 'ALL') {
            where.status = status;
        }

        if (startDate || endDate) {
            where.created_at = {};
            if (startDate && !Number.isNaN(startDate.getTime())) where.created_at.gte = startDate;
            if (endDate && !Number.isNaN(endDate.getTime())) where.created_at.lte = endDate;
        }

        const [totalReports, reports] = await Promise.all([
            prisma.report.count({ where }),
            prisma.report.findMany({
                where,
                orderBy: { created_at: order },
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);

        return res.status(200).json({
            message: 'Reports fetched',
            data: reports,
            pagination: {
                page,
                limit,
                totalReports,
                totalPages: Math.ceil(totalReports / limit),
                hasMore: page * limit < totalReports,
            },
            filters: {
                status: status === 'ALL' ? 'ALL' : status,
                order,
                startDate: req.query.startDate || null,
                endDate: req.query.endDate || null,
            },
        });

    }
    catch (error) {
        return res.status(500).json({ message: 'Unable to fetch reports', error: error.message });

    }
}

export const getReport = async (req, res) => {
    try {
     const report = await prisma.report.findFirst({
        where: {id : BigInt(req.params.id)}
     })
     if( !report) return res.status(404).json({message: " no such report found "});
     return res.status(200).json({message:"Found the report ",data: report})
    }
    catch (error) {
      return res.status(500).json({message:"Please try again later ", error: error.message})
    }
}