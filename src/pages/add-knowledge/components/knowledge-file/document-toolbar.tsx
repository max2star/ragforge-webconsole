import { ReactComponent as CancelIcon } from '@/assets/svg/cancel.svg';
import { ReactComponent as DeleteIcon } from '@/assets/svg/delete.svg';
import { ReactComponent as DisableIcon } from '@/assets/svg/disable.svg';
import { ReactComponent as EnableIcon } from '@/assets/svg/enable.svg';
import { ReactComponent as RunIcon } from '@/assets/svg/run.svg';
import { useShowDeleteConfirm, useTranslate } from '@/hooks/common-hooks';
import {
  useRemoveNextDocument,
  useRunNextDocument,
  useSetNextDocumentStatus,
} from '@/hooks/document-hooks';
import { IDocumentInfo } from '@/interfaces/database/document';
import { listDataset, moveKB } from '@/services/knowledge-service';
import {
  DownOutlined,
  DragOutlined,
  FileOutlined,
  FileTextOutlined,
  PlusOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import {
  Button,
  Dropdown,
  Flex,
  Form,
  Input,
  MenuProps,
  message,
  Modal,
  Select,
  Space,
} from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useLocation } from 'umi';
import { RunningStatus } from './constant';
import styles from './index.less';

interface IProps {
  selectedRowKeys: string[];
  showCreateModal(): void;
  showWebCrawlModal(): void;
  showDocumentUploadModal(): void;
  searchString: string;
  selectStatus: string | undefined;
  handleInputChange: React.ChangeEventHandler<HTMLInputElement>;
  handleOnSelect: (e: string | undefined) => void;
  documents: IDocumentInfo[];
  sortOrder?: 'asc' | 'desc' | '';
  toggleSortOrder?: () => void;
  onRefresh: () => void;
}

const DocumentToolbar = ({
  searchString,
  selectStatus,
  selectedRowKeys,
  showCreateModal,
  showDocumentUploadModal,
  handleInputChange,
  handleOnSelect,
  documents,
  sortOrder = '',
  toggleSortOrder = () => {},
  onRefresh,
}: IProps) => {
  const { t } = useTranslate('knowledgeDetails');
  const textTranslation = useTranslation().t;
  const { removeDocument } = useRemoveNextDocument();
  const showDeleteConfirm = useShowDeleteConfirm();
  const { runDocumentByIds } = useRunNextDocument();
  const { setDocumentStatus } = useSetNextDocumentStatus();
  const [showMoveModal, setShowMoveModal] = useState<boolean>(false);
  const [knowledgeList, setKnowledgeList] = useState<any[]>([]);
  const [form] = Form.useForm();
  const umiLocation: any = useLocation();

  const actionItems: MenuProps['items'] = useMemo(() => {
    return [
      {
        key: '1',
        onClick: showDocumentUploadModal,
        label: (
          <div>
            <Button type="link">
              <Space>
                <FileTextOutlined />
                {t('localFiles')}
              </Space>
            </Button>
          </div>
        ),
      },
      { type: 'divider' },
      {
        key: '3',
        onClick: showCreateModal,
        label: (
          <div>
            <Button type="link">
              <FileOutlined />
              {t('emptyFiles')}
            </Button>
          </div>
        ),
      },
    ];
  }, [showDocumentUploadModal, showCreateModal, t]);

  const handleDelete = useCallback(() => {
    const deletedKeys = selectedRowKeys.filter(
      (x) =>
        !documents
          .filter((y) => y.run === RunningStatus.RUNNING)
          .some((y) => y.id === x),
    );
    if (deletedKeys.length === 0) {
      toast.error(t('theDocumentBeingParsedCannotBeDeleted'));
      return;
    }
    showDeleteConfirm({
      onOk: () => {
        removeDocument(deletedKeys);
      },
    });
  }, [selectedRowKeys, showDeleteConfirm, documents, t, removeDocument]);

  const runDocument = useCallback(
    (run: number) => {
      runDocumentByIds({
        documentIds: selectedRowKeys,
        run,
        shouldDelete: false,
      });
    },
    [runDocumentByIds, selectedRowKeys],
  );

  const handleRunClick = useCallback(() => {
    runDocument(1);
  }, [runDocument]);

  const handleCancelClick = useCallback(() => {
    runDocument(2);
  }, [runDocument]);

  const onChangeStatus = useCallback((status: boolean) => {
    setDocumentStatus(selectedRowKeys, status);
  }, [setDocumentStatus, selectedRowKeys]);

  const onMove = async () => {
    setShowMoveModal(true);
    const res = await listDataset({}, { orderby: 'name' });
    if (res?.data?.code === 0 && Array.isArray(res.data?.data?.kbs)) {
      const list = res.data.data.kbs.map((item: any) => {
        return {
          label: `${item.name}（${item.id}）`,
          value: item.id,
        };
      });
      setKnowledgeList(list);
    }
  };
  const disabled = selectedRowKeys.length === 0;

  const handleEnableClick = useCallback(() => {
    onChangeStatus(true);
  }, [onChangeStatus]);

  const handleDisableClick = useCallback(() => {
    onChangeStatus(false);
  }, [onChangeStatus]);

  const items: MenuProps['items'] = useMemo(() => {
    return [
      {
        key: '0',
        onClick: handleEnableClick,
        label: (
          <Flex gap={10}>
            <EnableIcon></EnableIcon>
            <b>{t('enabled')}</b>
          </Flex>
        ),
      },
      {
        key: '1',
        onClick: handleDisableClick,
        label: (
          <Flex gap={10}>
            <DisableIcon></DisableIcon>
            <b>{t('disabled')}</b>
          </Flex>
        ),
      },
      { type: 'divider' },
      {
        key: '2',
        onClick: handleRunClick,
        label: (
          <Flex gap={10}>
            <RunIcon></RunIcon>
            <b>{t('run')}</b>
          </Flex>
        ),
      },
      {
        key: '3',
        onClick: handleCancelClick,
        label: (
          <Flex gap={10}>
            <CancelIcon />
            <b>{t('cancel')}</b>
          </Flex>
        ),
      },
      { type: 'divider' },
      {
        key: '4',
        onClick: handleDelete,
        label: (
          <Flex gap={10}>
            <span className={styles.deleteIconWrapper}>
              <DeleteIcon width={18} />
            </span>
            <b>{t('delete', { keyPrefix: 'common' })}</b>
          </Flex>
        ),
      },
      { type: 'divider' },
      {
        key: '5',
        onClick: onMove,
        label: (
          <Flex gap={10}>
            <span className={styles.deleteIconWrapper}>
              <DragOutlined />
            </span>
            <b>{t('move', { keyPrefix: 'common' })}</b>
          </Flex>
        ),
      },
    ];
  }, [
    handleDelete,
    handleRunClick,
    handleCancelClick,
    t,
    handleDisableClick,
    handleEnableClick,
    onMove,
  ]);

  const sortIcon =
    sortOrder === 'asc' ? (
      <SortAscendingOutlined />
    ) : sortOrder === 'desc' ? (
      <SortDescendingOutlined />
    ) : (
      <SwapOutlined />
    );

  return (
    <div className={styles.filter}>
      <Space>
        <Dropdown
          menu={{ items }}
          placement="bottom"
          arrow={false}
          disabled={disabled}
        >
          <Button>
            <Space>
              <b> {t('bulk')}</b>
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
        <Button onClick={toggleSortOrder} title="切换排序">
          {sortIcon}
          <span style={{ marginLeft: 6 }}>
            {sortOrder === 'asc'
              ? '升序'
              : sortOrder === 'desc'
                ? '降序'
                : '默认排序'}
          </span>
        </Button>
      </Space>

      <Space>
        <Select
          placeholder={t('selectStatus')}
          value={selectStatus}
          options={[
            {
              label: textTranslation(`knowledgeDetails.runningStatusAll`),
              value: '',
            },
            {
              label: textTranslation(`knowledgeDetails.runningStatus${0}`),
              value: '0',
            },
            {
              label: textTranslation(`knowledgeDetails.runningStatus${1}`),
              value: '1',
            },
            {
              label: textTranslation(`knowledgeDetails.runningStatus${2}`),
              value: '2',
            },
            {
              label: textTranslation(`knowledgeDetails.runningStatus${3}`),
              value: '3',
            },
            {
              label: textTranslation(`knowledgeDetails.runningStatus${4}`),
              value: '4',
            },
          ]}
          style={{ width: '200px' }}
          onSelect={(e) => {
            handleOnSelect(e);
          }}
        />
        <Input
          placeholder={t('searchFiles')}
          value={searchString}
          style={{ width: 220 }}
          allowClear
          onChange={handleInputChange}
          prefix={<SearchOutlined />}
        />

        <Dropdown menu={{ items: actionItems }} trigger={['click']}>
          <Button type="primary" icon={<PlusOutlined />}>
            {t('addFile')}
          </Button>
        </Dropdown>
      </Space>
      <Modal
        title="请选择目标知识库"
        open={showMoveModal}
        centered
        destroyOnHidden
        onCancel={() => {
          setShowMoveModal(false);
        }}
        onOk={async () => {
          const { dst_kb_id } = await form.validateFields();
          console.log(
            dst_kb_id,
            umiLocation.search.split('=')[1],
            selectedRowKeys,
          );
          const res = await moveKB({
            src_kb_id: umiLocation.search.split('=')[1],
            dst_kb_id,
            doc_ids: selectedRowKeys,
          });
          if (res.data.code === 0) {
            message.success('移动成功！');
            setShowMoveModal(false);
            onRefresh();
          } else {
            message.error(res.data.message);
          }
        }}
      >
        <Form form={form}>
          <Form.Item
            name="dst_kb_id"
            rules={[{ required: true, message: '请选择目标库' }]}
          >
            <Select
              showSearch
              options={knowledgeList}
              filterOption={(input, option) =>
                (option?.label || option.id || '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DocumentToolbar;
