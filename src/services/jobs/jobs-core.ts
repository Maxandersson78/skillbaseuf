
import { Job, JobFormData, JobStatus, JobType } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Core JobService class with basic job management functionality
class JobsServiceCore {
  // Get all jobs
  async getAllJobs(): Promise<Job[]> {
    try {
      console.log("JobsServiceCore: Getting all approved jobs");
      // For public view, only return approved jobs
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'approved');
        
      if (error) {
        console.error("Error fetching jobs:", error);
        return [];
      }

      console.log("Fetched all approved jobs:", data?.length || 0);

      // Convert Supabase data to match our Job type
      return data.map(job => this.mapDbJobToJobType(job));
    } catch (error) {
      console.error("Error fetching all jobs:", error);
      return [];
    }
  }

  // Get a single job by ID
  async getJobById(id: string): Promise<Job | null> {
    try {
      // First try to find the job
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error || !data) {
        console.error("Error fetching job by ID:", error);
        return null;
      }
      
      console.log("Fetched job by ID:", data?.id);
      
      // Convert database job to our Job type
      return this.mapDbJobToJobType(data);
    } catch (error) {
      console.error("Error fetching job by ID:", error);
      return null;
    }
  }
  
  // Delete a job
  async deleteJob(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Error deleting job:", error);
        return false;
      }
      
      console.log("Job deleted successfully:", id);
      return true;
    } catch (error) {
      console.error("Error deleting job:", error);
      return false;
    }
  }

  // Helper method to map database job record to our Job type
  protected mapDbJobToJobType(job: any): Job {
    // Make sure to explicitly cast job_type to JobType to maintain type safety
    return {
      id: job.id,
      companyId: job.company_id,
      title: job.title,
      description: job.description,
      requirements: job.requirements || '',
      jobType: job.job_type as JobType, // Explicitly cast to JobType enum
      educationRequired: job.education_required,
      location: job.location,
      salary: job.salary || '',
      email: job.email || '',
      phone: job.phone || '',
      createdAt: new Date(job.created_at),
      updatedAt: new Date(job.updated_at),
      companyName: job.company_name,
      status: job.status as JobStatus
    };
  }
}

export { JobsServiceCore };
