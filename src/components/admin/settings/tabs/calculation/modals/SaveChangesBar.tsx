import { Button } from '@/components/ui/button';

interface ISaveChangesBarProps {
  onCancel: () => void;
}

export default function SaveChangesBar(props: ISaveChangesBarProps) {
  const { onCancel } = props;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
        <div className="text-sm text-yellow-700 font-medium">Bạn có thay đổi chưa lưu</div>

        <div className="flex gap-3">
          <Button type="button" onClick={onCancel} variant="secondary">
            Hủy
          </Button>

          <Button type="submit" variant="success">
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
}
