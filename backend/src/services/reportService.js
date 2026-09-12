import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import ServiceOrder from '../models/ServiceOrder.js';
import Invoice from '../models/Invoice.js';
import Part from '../models/Part.js';
import Customer from '../models/Customer.js';
import Vehicle from '../models/Vehicle.js';
import Mechanic from '../models/Mechanic.js';
import { dayBounds } from '../utils/date.js';

const oid = (id) => new mongoose.Types.ObjectId(id);

async function getAdminDashboard(workshopId) {
  const wsId = oid(workshopId);
  const { start: todayStart, end: todayEnd } = dayBounds(new Date());
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [
    todaysAppointments, activeJobs, completedServices, revenueAgg,
    totalCustomers, totalVehicles, lowStockParts, mechanicWorkload,
  ] = await Promise.all([
    Appointment.countDocuments({ workshopId: wsId, start: { $gte: todayStart, $lte: todayEnd } }),
    ServiceOrder.countDocuments({ workshopId: wsId, status: { $in: ['in_progress', 'inspection', 'vehicle_received'] } }),
    ServiceOrder.countDocuments({ workshopId: wsId, status: 'completed' }),
    Invoice.aggregate([
      { $match: { workshopId: wsId, createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } },
    ]),
    Customer.countDocuments({ primaryWorkshopId: wsId }),
    Vehicle.countDocuments({ workshopId: wsId }),
    Part.countDocuments({ workshopId: wsId, $expr: { $lte: ['$quantity', '$minimumStockLevel'] } }),
    ServiceOrder.aggregate([
      { $match: { workshopId: wsId, status: { $nin: ['completed', 'cancelled'] } } },
      { $unwind: '$assignedMechanics' },
      { $group: { _id: '$assignedMechanics', jobs: { $sum: 1 } } },
      { $lookup: { from: 'mechanics', localField: '_id', foreignField: '_id', as: 'mechanic' } },
      { $unwind: '$mechanic' },
      { $lookup: { from: 'users', localField: 'mechanic.userId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { _id: 0, name: '$user.name', jobs: 1 } },
      { $sort: { jobs: -1 } },
    ]),
  ]);

  return {
    todaysAppointments,
    activeJobs,
    completedServices,
    revenueThisMonth: revenueAgg[0]?.total || 0,
    totalCustomers,
    totalVehicles,
    lowStockParts,
    mechanicWorkload,
  };
}

async function getReceptionistDashboard(workshopId) {
  const wsId = oid(workshopId);
  const { start: todayStart, end: todayEnd } = dayBounds(new Date());

  const [todaysAppointments, pendingAppointments, vehiclesInWorkshop, pendingInvoices] = await Promise.all([
    Appointment.find({ workshopId: wsId, start: { $gte: todayStart, $lte: todayEnd } })
      .populate([
        { path: 'customerId', populate: { path: 'userId', select: 'name email phone' } },
        { path: 'vehicleId' },
        { path: 'serviceId' },
      ])
      .sort({ start: 1 }).lean(),
    Appointment.countDocuments({ workshopId: wsId, status: 'pending' }),
    ServiceOrder.countDocuments({ workshopId: wsId, status: { $nin: ['completed', 'cancelled', 'booked'] } }),
    Invoice.countDocuments({ workshopId: wsId, paymentStatus: { $in: ['unpaid', 'partially_paid'] } }),
  ]);

  return { todaysAppointments, pendingAppointments, vehiclesInWorkshop, pendingInvoices };
}

async function getMechanicDashboard(workshopId, mechanicUserId) {
  const mechanic = await Mechanic.findOne({ workshopId, userId: mechanicUserId });
  if (!mechanic) return { assignedJobs: [], pending: 0, inProgress: 0, completedToday: 0 };

  const { start: todayStart, end: todayEnd } = dayBounds(new Date());

  const [assignedJobs, pending, inProgress, completedToday] = await Promise.all([
    ServiceOrder.find({ workshopId, assignedMechanics: mechanic._id, status: { $nin: ['completed', 'cancelled'] } })
      .populate([
        { path: 'customerId', populate: { path: 'userId', select: 'name email phone' } },
        { path: 'vehicleId' },
      ])
      .sort({ createdAt: -1 }).lean(),
    ServiceOrder.countDocuments({ workshopId, assignedMechanics: mechanic._id, status: 'booked' }),
    ServiceOrder.countDocuments({ workshopId, assignedMechanics: mechanic._id, status: 'in_progress' }),
    ServiceOrder.countDocuments({
      workshopId, assignedMechanics: mechanic._id, status: 'completed',
      updatedAt: { $gte: todayStart, $lte: todayEnd },
    }),
  ]);

  return { assignedJobs, pending, inProgress, completedToday };
}

async function getCustomerDashboard(customerId) {
  const custId = oid(customerId);

  const [activeServiceOrder, upcomingAppointment, recentInvoices, vehicles] = await Promise.all([
    ServiceOrder.findOne({ customerId: custId, status: { $nin: ['completed', 'cancelled'] } })
      .populate('vehicleId').sort({ createdAt: -1 }).lean(),
    Appointment.findOne({ customerId: custId, status: { $in: ['pending', 'confirmed'] }, start: { $gte: new Date() } })
      .populate('serviceId vehicleId').sort({ start: 1 }).lean(),
    Invoice.find({ customerId: custId }).sort({ createdAt: -1 }).limit(5).lean(),
    Vehicle.find({ customerId: custId, isActive: true }).lean(),
  ]);

  return { activeServiceOrder, upcomingAppointment, recentInvoices, vehicles };
}

export const reportService = { getAdminDashboard, getReceptionistDashboard, getMechanicDashboard, getCustomerDashboard };
