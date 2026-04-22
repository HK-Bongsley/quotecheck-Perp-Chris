'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import PhotoUploader from './PhotoUploader';
import type { IntakeQuestion } from '@/lib/types';

interface QuestionStepperProps {
  questions: IntakeQuestion[];
  categoryName: string;
}

export default function QuestionStepper({ questions, categoryName }: QuestionStepperProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number | boolean>>({});
  const [photos, setPhotos] = useState<File[]>([]);
  const [location, setLocation] = useState('');

  const question = questions[currentStep];
  const progress = ((currentStep + 1) / (questions.length + 2)) * 100; // +2 for location + photos

  const handleAnswer = (value: string | number | boolean) => {
    setAnswers({ ...answers, [question.id]: value });
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Go to photos
      setCurrentStep(questions.length);
    }
  };

  const handleLocationSubmit = () => {
    setCurrentStep(1);
  };

  const handlePhotosSubmit = async () => {
    // Submit to API
    const formData = new FormData();
    formData.append('categoryId', searchParams.get('category') || '1');
    formData.append('areaId', '1'); // Map location to areaId
    formData.append('answers', JSON.stringify(answers));
    // photos upload handled separately via signed URLs

    const response = await fetch('/api/estimate', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    router.push(`/estimate/${result.id}`);
  };

  if (currentStep === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{categoryName}</h2>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <Input
            placeholder="Enter your suburb/postcode (Pretoria, 0081, etc.)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="text-lg py-4"
          />
          <Button onClick={handleLocationSubmit} className="w-full btn-primary text-lg py-4">
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-sm text-gray-500 mb-2">Step {currentStep + 1} of {questions.length + 1}</div>
        <h2 className="text-2xl font-bold mb-2">{categoryName}</h2>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {currentStep < questions.length ? (
        <div className="space-y-4 p-6 bg-white rounded-2xl shadow-sm border">
          <div className="text-lg font-medium mb-4">{question.text}</div>
          
          {question.type === 'select' && question.options && (
            <div className="grid grid-cols-2 gap-3">
              {question.options.map((option) => (
                <Button
                  key={option}
                  variant="outline"
                  className="h-14 p-3 justify-start text-left"
                  onClick={() => handleAnswer(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          )}

          {question.type === 'number' && (
            <Input
              type="number"
              placeholder="Enter number"
              onChange={(e) => handleAnswer(parseInt(e.target.value) || 0)}
              className="text-lg py-4"
            />
          )}
        </div>
      ) : (
        <PhotoUploader photos={photos} onChange={setPhotos} />
      )}

      <div className="flex gap-3 pt-4">
        {currentStep > 0 && (
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            className="flex-1"
          >
            Back
          </Button>
        )}
        <Button 
          onClick={currentStep < questions.length ? handlePhotosSubmit : handlePhotosSubmit}
          className="flex-1 btn-primary"
        >
          {currentStep < questions.length ? 'Add Photos →' : 'Get Estimate'}
        </Button>
      </div>
    </div>
  );
}