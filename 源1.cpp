#include<iostream>
#include<stdlib.h>
#include<cstdio>
#include<ctime>
#include <algorithm>
#include <random>
#include <time.h>
using namespace std;
typedef struct {
	int d;//���ӵ���
	int lock;//��������
}dice;
int dollor;
int sum_round;
int q1;//n1���±�
int n1[10] = { 0 };
int n2[10] = { 0 };//����ѡ�������
dice a[10], b[10];
int mulw1;//���1����
int mulw2;//���2����
int mul1w1, mul1w2;
int count1(dice* a);
void init(dice* a) {
	for (int i = 0; i < 10; i++) {
		a[i].lock = 0;
	}
}
void twopeople()
{

	srand(time(0));
	std::random_device rd;
	std::mt19937 gen(rd());
	std::uniform_int_distribution<int> dis(1, 6);
	for (int i = 0; i < 5; i++)
	{
		a[i].d = dis(gen);
		b[i].d = dis(gen);
	}
	cout << "���1: " << endl;
	for (int i = 0; i < 5; i++)
	{
		cout << a[i].d << " ";
	}
	cout << endl;
	cout << "���2�� " << endl;
	for (int i = 0; i < 5; i++)
	{
		cout << b[i].d << " ";
	}
	cout << endl;
}
bool cmp(dice& a, dice& b)
{
	return a.d < b.d;
}
int count1(dice* a)
{
	int count[10] = { 0 };
	int sum = 0;
	int flag1 = 1;
	int flag2 = 1;
	for (int i = 0; i < 5; i++)
	{
		count[a[i].d]++;
	}
	sort(a, a + 5, cmp);
	for (int i = 1; i <= 6; i++)
	{
		if (count[i] == 5)
		{
			sum += 100;
			break;
		}//������100
		else if (count[i] == 4)
		{
			sum += 40;
			break;
		}//���� 
		else if (count[i] == 3)
		{
			int p = 1;
			sum += 10;
			while (p <= 6)
			{
				if (count[p] == 2) sum += 10;
				p++;
			}
			break;
		}//�����ͺ�«
		else if (count[i] == 2)
		{
			int p = i + 1;
			while (p <= 6)
			{
				if (count[p] == 2) sum += 10;
				p++;
			}
			break;
		}//˫��
	}
	int b[10] = { 0 };
	int t = 0;
	int dest = 0;
	int cur = 1;
	a[dest].d = a[0].d;
	//��cur==1  cur<numsSize
	while (cur < 5)
	{
		if (a[cur].d != a[dest].d)
		{
			b[t] = a[dest].d;
			a[++dest].d = a[cur++].d;
			t++;
		}
		else
		{
			cur++;
		}
	}//��������ɾ���ظ���
	b[dest] = a[dest].d;
	if (dest == 4)
	{
		int m = dest;
		while (m != 0)
		{
			if (b[m] != b[m - 1] + 1)
			{
				flag1 = 0;
				break;
			}
			m--;
		}
	}//�жϴ�˳��
	else if (dest == 3)
	{
		int m = dest;
		while (m != 0)
		{
			if (b[m] != b[m - 1] + 1)
			{
				flag2 = 0;
				break;
			}
			m--;
		}
	}//�ж�С˳��
	if (flag1 == 1 && dest == 4)
		sum += 60;
	if (flag2 == 1 && dest == 3)
		sum += 30;
	return sum;
}
int r1, r2;
void sock(dice* a, int q, int* n1, int r, int fg)
{
	cout << "��Ҫ������λ�ã� ";
	char b1[10];
	int num1 = 0;//t�ĳ���
	cin.getline(b1, 10);
	int t[10] = { 0 };
	int m1[10] = { 0 };//��������
	for (size_t i = 0; i < strlen(b1); i++) {
		t[i] = t[i] * 10 + (b1[i] - '0');
		num1++;
	}
	cout << "��Ҫ����������Ϊ�� ";
	if (num1 != 0)
		for (int i = 0; i < num1; i++)
		{
			m1[i] = a[t[i] - 1].d;
			cout << m1[i] << " ";
		}
	cout << endl;
	for (int i = 0; i < 5; i++)
	{
		int flag = 0;
		for (int j = 0; j < num1; j++)
			if (i == t[j] - 1) {
				flag = 1;
				a[i].lock = 1;
				break;
			}
		srand(time(0));
		std::random_device rd;
		std::mt19937 gen(rd());
		std::uniform_int_distribution<int> dis(1, 6);
		if (flag == 0 && a[i].lock == 0)
		{
			a[i].d = dis(gen);
			n1[r] = a[i].d;
			r++;
		}
	}//��������
	cout << "�µ�����Ϊ: ";
	for (int i = 0; i < 5; i++)
	{
		cout << a[i].d << " ";
	}
	cout << endl;
	if (q < 5 && sum_round < 4) {
		cout << "�����ѡ�������Ϊ: ";
		for (int i = q; i < r; i++, q++)
			cout << n1[i] << " ";
		cout << endl;
	}
	cout << "ѡ�����ı�����[1,2,3] ";
	if (fg == 1)
	{
		cin >> mul1w1;
		cin.get();
		mulw1 = mul1w1 * mulw1;
	}
	else if (fg == 2)
	{
		cin >> mul1w2;
		cin.get();
		mulw2 = mul1w2 * mulw2;
	}
	sum_round++;
}
int q2;
int numl;//����
int main()
{
	cout << "���þ����� ";
	cin >> numl;
	cout << "���ó��룺 ";
	int dollor;//����
	cin >> dollor;
	int dollor1 = dollor;
	int dollor2 = dollor;
	cin.get();
	for (int i = 0; i < numl; i++)
	{
		q1 = 0;
		q2 = 0;
		r1 = 0;
		r2 = 0;
		sum_round = 1;
		init(a);
		init(b);
		twopeople();
		mulw1 = 1;
		mulw2 = 1;
		while (sum_round < 5)
		{
			sock(a, q1, n1, r1, 1);
			sock(b, q2, n2, r2, 2);
		}
		cout << "���1�ķ����� ";
		cout << count1(a) << endl;
		cout << "���2�ķ����� ";
		cout << count1(b) << endl;
		if (count1(a) > count1(b))
		{
			dollor1 = dollor1 + mulw1 * (count1(a) - count1(b));
			cout << "���1�����2�����õĳ�������" << mulw1 * (count1(a) - count1(b)) << endl;
		}
		else if (count1(a) == count1(b))
		{
			cout << "ƽ��" << endl;
		}
		else
		{
			dollor2 = dollor2 + mulw2 * (count1(b) - count1(a));
			cout << "���2�����1�����õĳ�������" << mulw2 * (count1(b) - count1(a)) << endl;
		}
	}
	cout << "���1�ĳ���Ϊ�� " << dollor1 << endl;
	cout << "���2�ĳ���Ϊ�� " << dollor2 << endl;
	if (dollor1 > dollor2) {
		cout << "���1��ʤ" << endl;
	}
	else if (dollor1 == dollor2)
		cout << "ƽ��" << endl;
	else
		cout << "���2��ʤ" << endl;
	return 0;
}