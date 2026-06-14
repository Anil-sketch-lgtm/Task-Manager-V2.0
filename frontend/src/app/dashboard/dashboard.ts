import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService, Task } from '../services/task';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit {
  private taskService = inject(TaskService);
  private fb = inject(FormBuilder);

  tasks = signal<Task[]>([]);
  isPrioritizedView = signal<boolean>(false);

  // Modal State Signals
  isModalOpen = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  editingTaskId = signal<number | null>(null);

  totalTasks = computed(() => this.tasks().length);
  completedTasks = computed(() => this.tasks().filter(t => t.status === 'completed').length);
  pendingTasks = computed(() => this.tasks().filter(t => t.status !== 'completed').length);

  completionRate = computed(() => {
    const total = this.totalTasks();
    return total > 0 ? Math.round((this.completedTasks() / total) * 100) : 0;
  });

  highPriorityCount = computed(() => this.tasks().filter(t => t.priority === 3).length);
  mediumPriorityCount = computed(() => this.tasks().filter(t => t.priority === 2).length);
  lowPriorityCount = computed(() => this.tasks().filter(t => t.priority === 1).length);
  
  taskForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    deadline: [''],
    priority: [1, [Validators.min(1), Validators.max(3)]]
  });

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.isPrioritizedView.set(false);
    this.taskService.getTasks().subscribe({
      next: data => this.tasks.set(data),
      error: err => console.error(err)
    });
  }

  loadPrioritizedTasks() {
    this.isPrioritizedView.set(true);
    this.taskService.getPrioritizedTasks().subscribe({
      next: data => this.tasks.set(data),
      error: err => console.error(err)
    });
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.editingTaskId.set(null);
    this.taskForm.reset({ priority: 1 });
    this.isModalOpen.set(true);
  }

  openEditModal(task: Task) {
    this.isEditMode.set(true);
    this.editingTaskId.set(task.id || null);
    
    let formattedDeadline = '';
    if (task.deadline) {
      const date = new Date(task.deadline);
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - (offset * 60 * 1000));
      formattedDeadline = localDate.toISOString().slice(0, 16);
    }
    
    this.taskForm.patchValue({
      title: task.title,
      description: task.description || '',
      deadline: formattedDeadline,
      priority: task.priority
    });
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.taskForm.reset({ priority: 1 });
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      const taskData: Task = {
        title: formValue.title!,
        description: formValue.description || undefined,
        deadline: formValue.deadline ? new Date(formValue.deadline).toISOString() : undefined,
        priority: Number(formValue.priority)
      };

      if (this.isEditMode()) {
        const id = this.editingTaskId();
        if (id) {
          this.taskService.updateTask(id, taskData).subscribe({
            next: updatedTask => {
              this.tasks.update(t => t.map(x => x.id === id ? { ...x, ...updatedTask } : x));
              this.closeModal();
              if (this.isPrioritizedView()) this.loadPrioritizedTasks();
            },
            error: err => console.error(err)
          });
        }
      } else {
        this.taskService.createTask(taskData).subscribe({
          next: task => {
            this.tasks.update(t => [...t, task]);
            this.closeModal();
            if (this.isPrioritizedView()) this.loadPrioritizedTasks();
          },
          error: err => console.error(err)
        });
      }
    }
  }

  markComplete(task: Task) {
    if (!task.id) return;
    this.taskService.updateTask(task.id, { status: 'completed' }).subscribe(() => {
      task.status = 'completed';
      if (this.isPrioritizedView()) {
        this.tasks.update(t => t.filter(x => x.id !== task.id));
      }
    });
  }

  deleteTask(id: number) {
    this.taskService.deleteTask(id).subscribe(() => {
      this.tasks.update(t => t.filter(x => x.id !== id));
    });
  }
}
