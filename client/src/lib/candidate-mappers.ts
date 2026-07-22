import { type Job, type Application, type NotificationItem, type TimelineEvent } from './candidate-data';

export const mapJobToFrontend = (dbJob: any): Job => {
  if (!dbJob) return {} as Job;
  const companyInfo = dbJob.companyId || {};
  
  // Format salary
  let salaryStr = 'Not specified';
  if (dbJob.salaryMin !== undefined && dbJob.salaryMax !== undefined) {
    const currencySym = dbJob.currency === 'EUR' ? '€' : dbJob.currency === 'GBP' ? '£' : dbJob.currency === 'INR' ? '₹' : '$';
    salaryStr = `${currencySym}${(dbJob.salaryMin / 1000).toFixed(0)}k - ${currencySym}${(dbJob.salaryMax / 1000).toFixed(0)}k`;
  }

  return {
    id: dbJob._id || dbJob.id,
    title: dbJob.title || '',
    company: companyInfo.companyName || 'Unknown Company',
    companyLogo: companyInfo.logo || '',
    companyId: companyInfo._id || dbJob.companyId || '',
    location: dbJob.location || '',
    employmentType: dbJob.employmentType || 'Full-time',
    experienceLevel: dbJob.experienceLevel === 'Mid-Level' ? 'Mid' : dbJob.experienceLevel === 'Fresher' ? 'Entry' : dbJob.experienceLevel || 'Mid',
    salary: salaryStr,
    postedDate: dbJob.createdAt || new Date().toISOString(),
    remote: dbJob.remote || false,
    workMode: dbJob.workMode || (dbJob.remote ? 'Remote' : 'Onsite'),
    skills: dbJob.skills || [],
    description: dbJob.description || '',
    responsibilities: dbJob.responsibilities ? dbJob.responsibilities.split('\n').filter(Boolean) : [],
    requirements: dbJob.requirements ? dbJob.requirements.split('\n').filter(Boolean) : [],
    benefits: [],
    aboutCompany: companyInfo.description || '',
    industry: companyInfo.industry || '',
  };
};

export const mapApplicationToFrontend = (dbApp: any): Application => {
  if (!dbApp) return {} as Application;
  const dbJob = dbApp.jobId || {};
  return {
    id: dbApp._id,
    jobId: dbJob._id || dbApp.jobId,
    job: mapJobToFrontend(dbJob),
    appliedDate: dbApp.createdAt || new Date().toISOString(),
    status: dbApp.status || 'Applied',
    allowWithdraw: dbApp.allowWithdraw !== false,
  };
};

export const mapNotificationToFrontend = (dbNotif: any): NotificationItem => {
  if (!dbNotif) return {} as NotificationItem;
  
  // Map notification type
  let type: NotificationItem['type'] = 'application';
  if (dbNotif.type === 'job_alert' || dbNotif.type === 'jobAlert') type = 'job_alert';
  else if (dbNotif.type === 'company' || dbNotif.type === 'subscription') type = 'company';
  else if (dbNotif.type === 'interview') type = 'interview';

  return {
    id: dbNotif._id,
    type,
    title: dbNotif.title || '',
    message: dbNotif.message || '',
    time: dbNotif.createdAt || new Date().toISOString(),
    read: dbNotif.isRead || false,
  };
};

export const mapTimelineEventToFrontend = (dbApp: any): TimelineEvent => {
  if (!dbApp) return {} as TimelineEvent;
  const dbJob = dbApp.jobId || {};
  const companyName = dbJob.companyId?.companyName || 'Employer';

  let type: TimelineEvent['type'] = 'applied';
  let title = `Applied to ${companyName}`;
  let description = `Submitted application for ${dbJob.title || 'Job'}.`;

  if (dbApp.status === 'Under Review') {
    type = 'review';
    title = `Application Under Review by ${companyName}`;
    description = `Your profile is being reviewed for the ${dbJob.title || 'Job'} position.`;
  } else if (dbApp.status === 'Interview') {
    type = 'interview';
    title = `Interview Scheduled with ${companyName}`;
    description = `An interview round has been set up for ${dbJob.title || 'Job'}.`;
  } else if (dbApp.status === 'Shortlisted') {
    type = 'offer';
    title = `Shortlisted by ${companyName}`;
    description = `Your application was shortlisted.`;
  } else if (dbApp.status === 'Rejected') {
    type = 'rejected';
    title = `Application Closed by ${companyName}`;
    description = `They decided not to proceed with your application.`;
  } else if (dbApp.status === 'Hired') {
    type = 'offer';
    title = `Offer Extended by ${companyName}`;
    description = `Congratulations! You have been selected for the position.`;
  }

  return {
    id: dbApp._id,
    title,
    description,
    time: dbApp.updatedAt || dbApp.createdAt || new Date().toISOString(),
    type,
  };
};
